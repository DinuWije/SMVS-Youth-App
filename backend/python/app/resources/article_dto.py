class ArticleDTO:
    """
    Data Transfer Object (DTO) for validating and structuring Article input data.
    """

    def __init__(self, **kwargs):
        self.title = kwargs.get("title")
        self.author_id = kwargs.get("author_id")
        self.centre = kwargs.get("centre")
        self.cover_image = kwargs.get("cover_image")
        self.contents = kwargs.get("contents", [])

    def validate(self):
        """
        Validates the input data and returns a list of errors if any.
        """
        error_list = []

        # Validate title
        if not isinstance(self.title, str) or not self.title.strip():
            error_list.append("Title must be a non-empty string.")

        # Validate author_id
        if not isinstance(self.author_id, int):
            error_list.append("Author ID must be an integer.")

        # Validate contents
        if not isinstance(self.contents, list):
            error_list.append("Contents must be a list.")
        else:
            for i, content in enumerate(self.contents):
                if not isinstance(content, dict):
                    error_list.append(f"Content at position {i} must be a dictionary.")
                    continue  # Skip further validation for this entry
                
                content_type = content.get("content_type")
                content_data = content.get("content_data")
                position = content.get("position", i)

                if content_type not in {"text", "image", "video"}:
                    error_list.append(f"Content type '{content_type}' is invalid. Must be 'text', 'image', or 'video'.")

                if not isinstance(content_data, str) or not content_data.strip():
                    error_list.append(f"Content at position {i} must have a valid non-empty 'content_data' field.")

                if not isinstance(position, int) or position < 0:
                    error_list.append(f"Content at position {i} must have a valid integer 'position' >= 0.")

        return error_list

    def to_dict(self):
        """
        Converts DTO to a dictionary format to be used in the service layer.
        """
        return {
            "title": self.title,
            "author_id": self.author_id,
            "centre": self.centre,
            "cover_image": self.cover_image,
            "contents": self.contents,
        }
