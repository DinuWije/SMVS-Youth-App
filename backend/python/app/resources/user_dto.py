class UserDTO:
    def __init__(self, id, first_name, last_name, email, role, phone_number, location, interests, allow_notifs):
        self.id = id
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.role = role
        self.phone_number = phone_number
        self.location = location
        self.interests = interests
        self.allow_notifs = allow_notifs
