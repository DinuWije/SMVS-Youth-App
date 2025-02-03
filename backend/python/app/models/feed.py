from sqlalchemy import inspect
from sqlalchemy.orm.properties import ColumnProperty
from . import db

class Feed(db.Model):
    __tablename__ = "feed"

    id = db.Column(db.Integer, primary_key=True, nullable=False) 
    title = db.Column(db.String(255), nullable=False) 
    content = db.Column(db.Text, nullable=False)  
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False) 
    centre = db.Column(db.String(100), nullable=True)  
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())  
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())  # Last updated timestamp
    likes_count = db.Column(db.Integer, default=0)  
    users_who_have_liked = db.Column(db.ARRAY(db.Integer), default=[]) 
    comments_count = db.Column(db.Integer, default=0)  
    views_count = db.Column(db.Integer, default=0) 

    def to_dict(self, include_relationships=False):
        """Converts the Feed object to a dictionary format."""
        cls = type(self)
        mapper = inspect(cls)
        formatted = {}

        for column in mapper.attrs:
            field = column.key
            attr = getattr(self, field)

            if isinstance(column, ColumnProperty):
                formatted[field] = attr
            elif include_relationships:
                formatted[field] = [obj.to_dict() for obj in attr]

        return formatted
