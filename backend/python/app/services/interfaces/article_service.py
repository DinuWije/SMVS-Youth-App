from abc import ABC, abstractmethod


class IArticleService(ABC):
    """
    Interface for handling CRUD functionality for articles.
    """

    @abstractmethod
    def get_all_articles(self):
        """Return a list of all articles.

        :return: A list of dictionaries from Article objects.
        :rtype: list of dictionaries
        """
        pass

    @abstractmethod
    def get_article_by_id(self, article_id):
        """Return a dictionary representation of an Article object based on ID.

        :param article_id: Article ID
        :return: Dictionary representation of the Article object.
        :rtype: dictionary
        :raises Exception: If retrieval fails.
        """
        pass

    @abstractmethod
    def create_article(self, article_data):
        """Create a new Article object.

        :param article_data: Dictionary containing article fields.
        :return: Dictionary representation of the created Article object.
        :rtype: dictionary
        :raises Exception: If article fields are invalid.
        """
        pass

    @abstractmethod
    def update_article(self, article_id, article_data):
        """Update an existing article.

        :param article_id: Article ID
        :param article_data: Dictionary containing article fields.
        :return: Dictionary representation of the updated Article object.
        :rtype: dictionary
        :raises Exception: If update fails.
        """
        pass

    @abstractmethod
    def delete_article(self, article_id):
        """Delete an existing article.

        :param article_id: Article ID
        :return: ID of the deleted Article.
        :rtype: integer
        :raises Exception: If deletion fails.
        """
        pass
