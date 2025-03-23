from abc import ABC, abstractmethod

class IQuizService(ABC):
    """
    Interface for the Quiz Service.
    """

    @abstractmethod
    def create_quiz(self, quiz_data):
        """
        Creates a new quiz using validated DTO input.
        
        :param quiz_data: Dictionary containing quiz details.
        :type quiz_data: dict
        :return: Created quiz object
        :rtype: dict
        """
        pass

    @abstractmethod
    def get_quiz_by_id(self, quiz_id):
        """
        Retrieves a quiz by ID.

        :param quiz_id: ID of the quiz
        :type quiz_id: int
        :return: Quiz object or None
        :rtype: Quiz | None
        """
        pass

    @abstractmethod
    def get_quiz_by_article_id(self, article_id):
        """
        Retrieves a quiz by article ID.

        :param article_id: ID of the associated article
        :type article_id: int
        :return: Quiz object or None
        :rtype: Quiz | None
        """
        pass

    @abstractmethod
    def get_all_quizzes(self):
        """
        Retrieves all quizzes.

        :return: A list of dictionaries representing Quiz objects.
        :rtype: list[dict]
        """
        pass

    @abstractmethod
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
        pass

    @abstractmethod
    def delete_quiz(self, quiz_id):
        """
        Deletes a quiz.

        :param quiz_id: ID of the quiz
        :type quiz_id: int
        :return: True if successful, False otherwise
        :rtype: bool
        """
        pass
