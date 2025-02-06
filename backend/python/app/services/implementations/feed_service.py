from ...models.feed import Feed
from ...models import db
from ..interfaces.feed_service import IFeedService
from ...models.user_comment import UserComment


class FeedService(IFeedService):
    def __init__(self, logger):
        self.logger = logger

    def get_entities(self):
        """Retrieve all feed posts."""
        return [result.to_dict() for result in Feed.query.all()]

    def get_entity(self, id):
        """Retrieve a specific feed post by ID."""
        feed = Feed.query.get(id)
        if feed is None:
            self.logger.error("Invalid id")
            raise Exception("Invalid id")
        return feed.to_dict()

    def get_feeds_by_location(self, location):
        """Return feed posts filtered by location."""
        try:
            feeds = Feed.query.filter_by(centre=location).all()
            return [feed.to_dict() for feed in feeds]
        except Exception as e:
            self.logger.error(f"Error fetching feeds by location: {str(e)}")
            raise e

    def create_feed_post(self, entity):
        """Create a new feed post."""
        try:
            new_feed = Feed(**entity.__dict__)  # Map DTO fields to Feed model
        except Exception as error:
            self.logger.error(str(error))
            raise error

        db.session.add(new_feed)
        db.session.commit()

        return new_feed.to_dict()

    def update_entity(self, id, entity):
        """Update an existing feed post."""
        Feed.query.filter_by(id=id).update(entity.__dict__)
        updated_feed = Feed.query.get(id)
        db.session.commit()

        if updated_feed is None:
            self.logger.error("Invalid id")
            raise Exception("Invalid id")
        return updated_feed.to_dict()

    def delete_entity(self, id):
        """Delete a feed post by ID."""
        deleted = Feed.query.filter_by(id=id).delete()
        db.session.commit()

        if deleted == 1:
            return id

        self.logger.error("Invalid id")
        raise Exception("Invalid id")

    def add_like(self, feed_id, user_id):
        """Increment likes_count and update users_who_have_liked."""
        feed = Feed.query.get(feed_id)
        if not feed:
            raise Exception("Invalid feed ID")

        if user_id in feed.users_who_have_liked:
            raise Exception("User has already liked this post")

        feed.likes_count += 1
        feed.users_who_have_liked.append(user_id)

        db.session.commit()
        return feed.to_dict()

    def add_comment(self, feed_id, user_id, content, parent_id=None):
            """Create a comment on a feed post and update comments_count."""
            feed = Feed.query.get(feed_id)
            if not feed:
                raise Exception("Invalid feed ID")

            new_comment = UserComment(
                feed_id=feed_id,
                user_id=user_id,
                content=content,
                parent_id=parent_id
            )

            db.session.add(new_comment)
            feed.comments_count += 1  # Increment comment count in Feed table
            db.session.commit()

            return feed.to_dict()

    def increment_view_count(self, feed_id):
        """Increment views_count."""
        feed = Feed.query.get(feed_id)
        if not feed:
            raise Exception("Invalid feed ID")

        feed.views_count += 1

        db.session.commit()
        return feed.to_dict()
