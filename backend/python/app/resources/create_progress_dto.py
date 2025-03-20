class CreateProgressDTO:
    def __init__(self, **kwargs):
        self.user_id = kwargs.get("user_id")
        self.content_type = kwargs.get("content_type")
        self.points_collected = kwargs.get("points_collected")

    def validate(self):
        error_list = []
        return error_list
