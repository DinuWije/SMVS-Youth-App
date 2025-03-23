class ProgressDTO:
    def __init__(self, id, user_id, content_type, points_collected, date):
        self.id = id
        self.user_id = user_id
        self.content_type = content_type
        self.points_collected = points_collected
        self.date = date