from sqlalchemy import inspect
from sqlalchemy.orm.properties import ColumnProperty
from . import db
from datetime import datetime

class UserComment(db.Model):  
    __tablename__ = "user_comments" 

    id = db.Column(db.Integer, primary_key=True, nullable=False)  
    feed_id = db.Column(db.Integer, db.ForeignKey("feed.id"), nullable=False)  
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)  
    content = db.Column(db.Text, nullable=False) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 
    parent_id = db.Column(db.Integer, db.ForeignKey("user_comments.id"), nullable=True) 

    def to_dict(self, include_relationships=False):
        """Converts the UserComment object to a dictionary format."""
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
