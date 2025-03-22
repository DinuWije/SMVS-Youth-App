import random
from ...models import db
from ...models.article import Article
from ...models.content import Content
from ..interfaces.article_service import IArticleService
from ...models.quiz import Quiz
from ...models.quiz_completions import QuizCompletion

class ArticleService(IArticleService):
    """
    Service for handling Article-related operations.
    """

    def __init__(self, logger):
        """
        Initializes the ArticleService.

        :param logger: application's logger instance
        :type logger: logger
        """
        self.logger = logger
        
    def create_article(self, article_data):
        """
        Creates a new article using validated DTO input.
        
        :param article_data: Dictionary containing article details.
        :type article_data: dict
        :return: Created article object with content
        :rtype: dict
        """
        try:
            title = article_data.get("title")
            subtitle = article_data.get("subtitle")
            author_id = article_data.get("author_id")
            centre = article_data.get("centre", None)
            contents = article_data.get("contents", [])
            cover_image = article_data.get("cover_image", None)

            if not title or not author_id:
                raise ValueError("Title and author_id are required fields.")
            
            rating = round(random.uniform(4.0, 5.0), 2)  # Random float between 4 and 5
            number_of_ratings = random.randint(5, 30) 
            time_to_read = random.choice([15, 20, 25, 30])  # Random selection from predefined values

            article = Article(
                title=title,
                subtitle=subtitle,
                author_id=author_id,
                centre=centre,
                cover_image=cover_image,
                rating=rating,
                number_of_ratings=number_of_ratings,
                time_to_read=time_to_read
            )
            db.session.add(article)
            db.session.flush()

            if contents:
                content_objects = [
                    Content(
                        article_id=article.id,
                        content_type=c["content_type"],
                        content_data=c["content_data"],
                        position=c.get("position", i),
                    )
                    for i, c in enumerate(contents)
                ]
                db.session.bulk_save_objects(content_objects)

            db.session.commit()
            return article.to_dict(include_relationships=True)

        except Exception as e:
            self.logger.error(f"Failed to create article: {str(e)}")
            db.session.rollback()
            raise


    def get_article_by_id(self, article_id, include_relationships=False):
        """
        Retrieves an article by ID.

        :param article_id: ID of the article
        :type article_id: int
        :param include_relationships: Whether to include related content
        :type include_relationships: bool, optional
        :return: Article object or None
        :rtype: Article | None
        """
        try:
            article = Article.query.get(article_id)
            if not article:
                return None
            return article.to_dict(include_relationships) if article else None
        except Exception as e:
            self.logger.error(f"Failed to retrieve article: {str(e)}")
            raise

    def get_all_articles(self):
        """
        Retrieves all articles.

        :return: A list of dictionaries representing Article objects.
        :rtype: list[dict]
        """
        try:
            articles = Article.query.all()
            return [article.to_dict(True) for article in articles]
        except Exception as e:
            self.logger.error(f"Failed to retrieve articles: {str(e)}")
            raise


    def update_article(self, article_id, **updates):
        """
        Updates an article and its associated content.

        :param article_id: ID of the article
        :type article_id: int
        :param updates: Fields to update, including optional content updates
        :type updates: dict
        :return: Updated article object or None if not found
        :rtype: dict | None
        """
        try:
            article = Article.query.get(article_id)
            if not article:
                self.logger.warning(f"Attempted to update non-existent article {article_id}")
                return None

            for key, value in updates.items():
                if key != "contents" and hasattr(article, key):
                    setattr(article, key, value)

            if "contents" in updates:
                new_content_list = updates["contents"]
                existing_content = {c.id: c for c in article.contents}
                updated_content_ids = set()
                new_contents = []

                for content_data in new_content_list:
                    content_id = content_data.get("id")

                    if content_id and content_id in existing_content:
                        content = existing_content[content_id]
                        content.content_type = content_data.get("content_type", content.content_type)
                        content.content_data = content_data.get("content_data", content.content_data)
                        content.position = content_data.get("position", content.position)
                        updated_content_ids.add(content_id)
                    else:
                        new_contents.append(
                            Content(
                                article_id=article.id,
                                content_type=content_data["content_type"],
                                content_data=content_data["content_data"],
                                position=content_data.get("position", len(existing_content) + 1),
                            )
                        )

                if new_contents:
                    db.session.bulk_save_objects(new_contents)

                for content_id in existing_content.keys():
                    if content_id not in updated_content_ids:
                        db.session.delete(existing_content[content_id])

            db.session.commit()
            return article.to_dict(include_relationships=True)

        except Exception as e:
            self.logger.error(f"Failed to update article {article_id}: {str(e)}")
            db.session.rollback()
            raise


    def delete_article(self, article_id):
        """
        Deletes an article and its associated data.

        :param article_id: ID of the article
        :type article_id: int
        :return: True if successful, False otherwise
        :rtype: bool
        """
        try:
            article = Article.query.get(article_id)
            if not article:
                self.logger.warning(f"Attempted to delete non-existent article {article_id}")
                return False

            # First, find and delete any associated quiz completions
            QuizCompletion.query.filter_by(article_id=article_id).delete()
            
            # Next, find and delete any associated quizzes
            Quiz.query.filter_by(article_id=article_id).delete()
            
            # Delete article contents
            Content.query.filter_by(article_id=article_id).delete()
            
            # Finally delete the article
            db.session.delete(article)
            db.session.commit()
            return True

        except Exception as e:
            self.logger.error(f"Failed to delete article {article_id}: {str(e)}")
            db.session.rollback()
            raise
