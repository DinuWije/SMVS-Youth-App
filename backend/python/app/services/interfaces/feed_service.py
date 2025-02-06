from abc import ABC, abstractmethod

class IFeedService(ABC):
    @abstractmethod
    def get_entities(self):
        pass

    @abstractmethod
    def get_entity(self, id):
        pass

    @abstractmethod
    def create_feed_post(self, entity):
        pass

    @abstractmethod
    def update_entity(self, id, entity):
        pass

    @abstractmethod
    def delete_entity(self, id):
        pass

    @abstractmethod
    def add_like(self, feed_id, user_id):
        pass

    @abstractmethod
    def add_comment(self, feed_id, user_id, content, parent_id=None):
        pass

    @abstractmethod
    def increment_view_count(self, feed_id):
        pass
