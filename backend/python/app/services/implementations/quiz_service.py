from ...models import db
from ...models.quiz import Quiz
from ...models.article import Article
from ..interfaces.quiz_service import IQuizService


class QuizService(IQuizService):
    """
    Service for handling Quiz-related operations.
    """

    def __init__(self, logger):
        """
        Initializes the QuizService.

        :param logger: application's logger instance
        :type logger: logger
        """
        self.logger = logger
        
    def create_quiz(self, quiz_data):
        """
        Creates a new quiz using validated DTO input.
        
        :param quiz_data: Dictionary containing quiz details.
        :type quiz_data: dict
        :return: Created quiz object
        :rtype: dict
        """
        try:
            title = quiz_data.get("title")
            article_id = quiz_data.get("article_id")
            questions = quiz_data.get("questions", [])

            if not title or not article_id:
                raise ValueError("Title and article_id are required fields.")
            
            # Check if article exists
            article = Article.query.get(article_id)
            if not article:
                raise ValueError(f"Article with ID {article_id} not found.")
                
            # Check if quiz already exists for this article
            existing_quiz = Quiz.query.filter_by(article_id=article_id).first()
            if existing_quiz:
                raise ValueError(f"Quiz already exists for article with ID {article_id}.")

            quiz = Quiz(
                title=title,
                article_id=article_id,
                questions=questions  # Store questions as JSON
            )
            db.session.add(quiz)
            db.session.commit()
            return quiz.to_dict()

        except Exception as e:
            self.logger.error(f"Failed to create quiz: {str(e)}")
            db.session.rollback()
            raise

    def get_quiz_by_id(self, quiz_id):
        """
        Retrieves a quiz by ID.

        :param quiz_id: ID of the quiz
        :type quiz_id: int
        :return: Quiz object or None
        :rtype: Quiz | None
        """
        try:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                return None
            return quiz.to_dict()
        except Exception as e:
            self.logger.error(f"Failed to retrieve quiz: {str(e)}")
            raise

    def get_quiz_by_article_id(self, article_id):
        """
        Retrieves a quiz by article ID.

        :param article_id: ID of the associated article
        :type article_id: int
        :return: Quiz object or None
        :rtype: Quiz | None
        """
        try:
            quiz = Quiz.query.filter_by(article_id=article_id).first()
            if not quiz:
                return None
            return quiz.to_dict()
        except Exception as e:
            self.logger.error(f"Failed to retrieve quiz by article ID: {str(e)}")
            raise

    def get_all_quizzes(self):
        """
        Retrieves all quizzes.

        :return: A list of dictionaries representing Quiz objects.
        :rtype: list[dict]
        """
        try:
            quizzes = Quiz.query.all()
            return [quiz.to_dict() for quiz in quizzes]
        except Exception as e:
            self.logger.error(f"Failed to retrieve quizzes: {str(e)}")
            raise

    def update_quiz(self, quiz_id, quiz_data):
        """
        Updates a quiz.

        :param quiz_id: ID of the quiz
        :type quiz_id: int
        :param quiz_data: Fields to update
        :type quiz_data: dict
        :return: Updated quiz object or None if not found
        :rtype: dict | None
        """
        try:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                self.logger.warning(f"Attempted to update non-existent quiz {quiz_id}")
                return None

            for key, value in quiz_data.items():
                if hasattr(quiz, key):
                    setattr(quiz, key, value)

            db.session.commit()
            return quiz.to_dict()

        except Exception as e:
            self.logger.error(f"Failed to update quiz {quiz_id}: {str(e)}")
            db.session.rollback()
            raise

    def delete_quiz(self, quiz_id):
        """
        Deletes a quiz.

        :param quiz_id: ID of the quiz
        :type quiz_id: int
        :return: True if successful, False otherwise
        :rtype: bool
        """
        try:
            quiz = Quiz.query.get(quiz_id)
            if not quiz:
                self.logger.warning(f"Attempted to delete non-existent quiz {quiz_id}")
                return False

            db.session.delete(quiz)
            db.session.commit()
            return True

        except Exception as e:
            self.logger.error(f"Failed to delete quiz {quiz_id}: {str(e)}")
            db.session.rollback()
            raise
