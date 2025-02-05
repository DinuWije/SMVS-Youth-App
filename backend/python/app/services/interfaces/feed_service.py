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
