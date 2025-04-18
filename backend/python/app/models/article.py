from sqlalchemy import inspect
from sqlalchemy.orm.properties import ColumnProperty
from . import db


class Article(db.Model):
    __tablename__ = "article"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    subtitle = db.Column(db.String(255), nullable=True)
    author_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    centre = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(
        db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp()
    )
    rating = db.Column(db.Float, default=4.0)
    number_of_ratings = db.Column(db.Integer, default=200)
    time_to_read = db.Column(db.Integer, default=25)
    cover_image = db.Column(db.Text, nullable=True)
    contents = db.relationship("Content", backref="article", lazy="dynamic")

    def to_dict(self, include_relationships=False):
        """Converts the Article object to a dictionary format."""
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
