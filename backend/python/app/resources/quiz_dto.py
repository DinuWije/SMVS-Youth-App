from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional


@dataclass
class QuizDTO:
    """Data Transfer Object for Quiz."""
    
    title: str
    article_id: int
    questions: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self):
        """Convert DTO to dictionary."""
        return {
            "title": self.title,
            "article_id": self.article_id,
            "questions": self.questions
        }
    
    def validate(self):
        """Validate quiz data."""
        errors = []
        
        return errors
