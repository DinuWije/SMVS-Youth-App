from abc import ABC, abstractmethod


class IReflectionService(ABC):
    """
    Interface for handling CRUD functionality for articles.
    """
    def __init__(self, logger):
        self.logger = logger 
        
    @abstractmethod
    def get_all_reflections(self, user_id):
        """Return a list of all articles.

        :return: A list of dictionaries from Article objects.
        :rtype: list of dictionaries
        """
        pass

    @abstractmethod
    def get_recent_reflections(self, user_id, limit=5):
        """Return a dictionary representation of an Article object based on ID.

        :param article_id: Article ID
        :return: Dictionary representation of the Article object.
        :rtype: dictionary
        :raises Exception: If retrieval fails.
        """
        pass

    @abstractmethod
    def get_reflection_by_id(self, reflection_id, user_id=None):
        """Create a new Article object.

        :param article_data: Dictionary containing article fields.
        :return: Dictionary representation of the created Article object.
        :rtype: dictionary
        :raises Exception: If article fields are invalid.
        """
        pass

    @abstractmethod
    def create_reflection(self, reflection_data):
        """Update an existing article.

        :param article_id: Article ID
        :param article_data: Dictionary containing article fields.
        :return: Dictionary representation of the updated Article object.
        :rtype: dictionary
        :raises Exception: If update fails.
        """
        pass

    @abstractmethod
    def update_reflection(self, reflection_id, reflection_data, user_id=None):
        """Delete an existing article.

        :param article_id: Article ID
        :return: ID of the deleted Article.
        :rtype: integer
        :raises Exception: If deletion fails.
        """
        pass
    
    @abstractmethod
    def delete_reflection(self, reflection_id, user_id=None):
        """Delete a reflection."""
        pass
    
    @abstractmethod
    def save_reflection(self, reflection_id, user_id):
        """Mark a reflection as saved."""
        pass

    @abstractmethod
    def get_reflection_prompt(self, reflection_type):
        """Get a prompt for the reflection type."""
        pass

    @abstractmethod
    def generate_ai_response(self, user_reflection, reflection_type):
        """Generate an AI response to the user's reflection."""
        pass

    @abstractmethod
    def _get_mock_ai_response(self, reflection_type):
        pass
