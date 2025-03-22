from sqlalchemy import inspect
from sqlalchemy.orm.properties import ColumnProperty
from . import db
class QuizCompletion(db.Model):
    __tablename__ = "quiz_completions"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quiz.id"), nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey("article.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # Store the user's score
    completed_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    
    # Relationships
    user = db.relationship("User", backref="quiz_completions")
    quiz = db.relationship("Quiz", backref="completions")
    article = db.relationship("Article", backref="quiz_completions")

    def to_dict(self):
        cls = type(self)
        mapper = inspect(cls)
        formatted = {}
        for column in mapper.attrs:
            field = column.key
            attr = getattr(self, field)
            if isinstance(column, ColumnProperty):
                formatted[field] = attr
        return formatted
