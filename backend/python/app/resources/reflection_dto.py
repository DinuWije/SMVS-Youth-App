class ReflectionDTO:
    def __init__(self, **kwargs):
        self.id = kwargs.get("id")
        self.user_id = kwargs.get("user_id")
        self.reflection_type = kwargs.get("reflection_type")
        self.prompt = kwargs.get("prompt")
        self.user_reflection = kwargs.get("user_reflection")
        self.ai_response = kwargs.get("ai_response")
        self.saved = kwargs.get("saved", False)

    def validate(self):
        """Validates the DTO fields."""
        errors = []
        return errors

    def to_dict(self):
        """Converts DTO to dictionary."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "reflection_type": self.reflection_type,
            "prompt": self.prompt,
            "user_reflection": self.user_reflection,
            "ai_response": self.ai_response,
            "saved": self.saved
        }


class ReflectionPromptDTO:
    def __init__(self, **kwargs):
        self.reflection_type = kwargs.get("reflection_type")
        self.user_id = kwargs.get("user_id")

    def validate(self):
        """Validates the DTO fields."""
        errors = []
        return errors

    def to_dict(self):
        """Converts DTO to dictionary."""
        return {
            "reflection_type": self.reflection_type,
            "user_id": self.user_id
        }


class AiResponseDTO:
    def __init__(self, **kwargs):
        self.reflection_id = kwargs.get("reflection_id")
        self.user_reflection = kwargs.get("user_reflection")
        self.reflection_type = kwargs.get("reflection_type")

    def validate(self):
        """Validates the DTO fields."""
        errors = []
        return errors

    def to_dict(self):
        """Converts DTO to dictionary."""
        return {
            "reflection_id": self.reflection_id,
            "user_reflection": self.user_reflection,
            "reflection_type": self.reflection_type
        }
