ALLOWABLE_CONTENT_TYPES = [
    "text/plain",
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
]


class EntityDTO(object):
    def __init__(self, **kwargs):
        self.file = kwargs.get("file")

    def validate(self):
        error_list = []
        if self.file:
            if self.file.content_type not in ALLOWABLE_CONTENT_TYPES:
                error_list.append(
                    "The file  type {file_content_type} is not one of {allowed_types_str}".format(
                        file_content_type=self.file.content_type,
                        allowed_types_str=", ".join(ALLOWABLE_CONTENT_TYPES),
                    )
                )

        return error_list
