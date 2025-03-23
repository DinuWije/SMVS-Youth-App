from ...models import db
from ...models.quiz_completions import QuizCompletion
from ..interfaces.quiz_completion_service import IQuizCompletionService

class QuizCompletionService(IQuizCompletionService):
    def __init__(self, logger):
        self.logger = logger
        
    def record_completion(self, user_id, quiz_id, article_id, score):
        """
        Record a quiz completion.
        
        :param user_id: ID of the user
        :param quiz_id: ID of the quiz
        :param article_id: ID of the associated article
        :param score: User's score on the quiz
        :return: Created completion record
        """
        try:
            completion = QuizCompletion(
                user_id=user_id,
                quiz_id=quiz_id,
                article_id=article_id,
                score=score
            )
            db.session.add(completion)
            db.session.commit()
            return completion.to_dict()
        except Exception as e:
            self.logger.error(f"Failed to record quiz completion: {str(e)}")
            db.session.rollback()
            raise
            
    def get_user_completions(self, user_id):
        """
        Get all quiz completions for a user.
        
        :param user_id: ID of the user
        :return: List of quiz completion records
        """
        try:
            completions = QuizCompletion.query.filter_by(user_id=user_id).all()
            return [completion.to_dict() for completion in completions]
        except Exception as e:
            self.logger.error(f"Failed to get user quiz completions: {str(e)}")
            raise
            
    def check_completion(self, user_id, article_id):
        """
        Check if a user has completed the quiz for a specific article.
        
        :param user_id: ID of the user
        :param article_id: ID of the article
        :return: Boolean indicating completion status and completion details if available
        """
        try:
            completion = QuizCompletion.query.filter_by(
                user_id=user_id,
                article_id=article_id
            ).first()
            
            if not completion:
                return {"completed": False, "completion": None}
                
            return {"completed": True, "completion": completion.to_dict()}
        except Exception as e:
            self.logger.error(f"Failed to check quiz completion: {str(e)}")
            raise
    
    def delete_completion(self, completion_id):
        """
        Delete a quiz completion record.
        
        :param completion_id: ID of the completion record
        :type completion_id: int
        :return: True if successful, False otherwise
        :rtype: bool
        """
        try:
            completion = QuizCompletion.query.get(completion_id)
            if not completion:
                return False
                
            db.session.delete(completion)
            db.session.commit()
            return True
        except Exception as e:
            self.logger.error(f"Failed to delete quiz completion {completion_id}: {str(e)}")
            db.session.rollback()
            raise
