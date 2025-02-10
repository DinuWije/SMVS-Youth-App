class FeedDTO:
    def __init__(self, title, content, author_id, centre=None, created_at=None, likes_count=0, users_who_have_liked=None, comments_count=0, views_count=0):
        self.title = title
        self.content = content
        self.author_id = author_id
        self.centre = centre 
        self.created_at = created_at  
        self.likes_count = likes_count 
        self.users_who_have_liked = users_who_have_liked if users_who_have_liked is not None else []  
        self.comments_count = comments_count 
        self.views_count = views_count 

    def to_dict(self):
        """Convert DTO to dictionary format for API responses."""
        return {
            "title": self.title,
            "content": self.content,
            "author_id": self.author_id,
            "centre": self.centre,
            "created_at": self.created_at,
            "likes_count": self.likes_count,
            "users_who_have_liked": self.users_who_have_liked,
            "comments_count": self.comments_count,
            "views_count": self.views_count,
        }

    def validate(self):
        errors = []

        if not self.title or not isinstance(self.title, str):
            errors.append("Title is required and must be a string.")
        
        if not self.content or not isinstance(self.content, str):
            errors.append("Content is required and must be a string.")

        if not self.author_id or not isinstance(self.author_id, int):
            errors.append("Author ID is required and must be an integer.")

        if self.centre is not None and not isinstance(self.centre, str):
            errors.append("Centre must be a string if provided.")

        if not isinstance(self.likes_count, int) or self.likes_count < 0:
            errors.append("Likes count must be a non-negative integer.")

        if not isinstance(self.comments_count, int) or self.comments_count < 0:
            errors.append("Comments count must be a non-negative integer.")

        if not isinstance(self.views_count, int) or self.views_count < 0:
            errors.append("Views count must be a non-negative integer.")

        if errors:
            return ", ".join(errors)  # Return all errors as a single string

        return None  # No errors
