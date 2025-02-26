class EmailUsersDTO:
    def __init__(self, **kwargs):
        self.subject = kwargs.get("subject")
        self.body = kwargs.get("body")

    def validate(self):
        error_list = []
        if type(self.subject) is not str:
            error_list.append("The subject supplied is not a string.")
        if type(self.body) is not str:
            error_list.append("The body supplied is not a string.")
        return error_list
