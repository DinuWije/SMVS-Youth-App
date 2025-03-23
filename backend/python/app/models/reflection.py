from sqlalchemy import inspect
from sqlalchemy.orm.properties import ColumnProperty
from . import db


class Reflection(db.Model):
    __tablename__ = "reflection"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reflection_type = db.Column(db.String(50), nullable=False)  # gratitude, stress, goals, meditation, emotion
    prompt = db.Column(db.Text, nullable=True)
    user_reflection = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=True)
    saved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp()
    )

    def to_dict(self, include_relationships=False):
        """Converts the Reflection object to a dictionary format."""
        cls = type(self)
        mapper = inspect(cls)
        formatted = {}

        for column in mapper.attrs:
            field = column.key
            attr = getattr(self, field)

            if isinstance(column, ColumnProperty):
                formatted[field] = attr
            elif include_relationships and attr is not None:
                if hasattr(attr, "__iter__"):
                    formatted[field] = [obj.to_dict() for obj in attr]
                else:
                    formatted[field] = attr.to_dict()

        return formatted
