from abc import ABC, abstractmethod

class IQuizCompletionService(ABC):
    """
    Interface for the Quiz Completion Service.
    """

    @abstractmethod
    def record_completion(self, user_id, quiz_id, article_id, score):
        """
        Creates a new quiz using validated DTO input.
        
        :param quiz_data: Dictionary containing quiz details.
        :type quiz_data: dict
        :return: Created quiz object
        :rtype: dict
        """
        pass

    @abstractmethod
    def get_user_completions(self, user_id):
        """
        Retrieves a quiz by ID.

        :param quiz_id: ID of the quiz
        :type quiz_id: int
        :return: Quiz object or None
        :rtype: Quiz | None
        """
        pass

    @abstractmethod
    def check_completion(self, user_id, article_id):
        """
        Retrieves a quiz by article ID.

        :param article_id: ID of the associated article
        :type article_id: int
        :return: Quiz object or None
        :rtype: Quiz | None
        """
        pass

    @abstractmethod
    def delete_completion(self, completion_id):
        pass
