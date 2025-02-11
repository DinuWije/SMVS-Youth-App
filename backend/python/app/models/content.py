from . import db

class Content(db.Model):
    __tablename__ = "content"

    id = db.Column(db.Integer, primary_key=True, nullable=False)
    article_id = db.Column(db.Integer, db.ForeignKey("article.id"), nullable=False)
    content_type = db.Column(db.String(50), nullable=False)
    content_data = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "content_type": self.content_type,
            "content_data": self.content_data,
            "position": self.position,
        }