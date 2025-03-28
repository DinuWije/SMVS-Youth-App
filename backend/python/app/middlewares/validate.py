from flask import jsonify, request
from functools import wraps
import json
from ..resources.create_user_dto import CreateUserDTO
from ..resources.entity_dto import EntityDTO
from ..resources.simple_entity_dto import SimpleEntityDTO
from ..resources.register_user_dto import RegisterUserDTO
from ..resources.update_user_dto import UpdateUserDTO
from ..resources.article_dto import ArticleDTO
from ..resources.reflection_dto import ReflectionDTO
from ..resources.feed_dto import FeedDTO  
from ..resources.quiz_dto import QuizDTO

dtos = {
    "CreateUserDTO": CreateUserDTO,
    "EntityDTO": EntityDTO,
    "SimpleEntityDTO": SimpleEntityDTO,
    "RegisterUserDTO": RegisterUserDTO,
    "UpdateUserDTO": UpdateUserDTO,
    "ArticleDTO": ArticleDTO,
    "FeedDTO": FeedDTO, 
    "QuizDTO": QuizDTO, 
    "ReflectionDTO": ReflectionDTO,
}


def validate_request(dto_class_name):
    """
    Determine if request is valid based on the types of the arguments passed in to create or update a dto

    :param dto_class_name: the class name to create or update dto
    :type dto_class_name: str
    """
    def validate_dto(api_func):
        @wraps(api_func)
        def wrapper(*args, **kwargs):
            if (
                request.content_type
                and len(request.content_type.split(";")) > 0
                and request.content_type.split(";")[0] == "application/json"
            ):
                # Requests with a JSON body must explicitly specify
                # application/json as the Content-Type header.
                # Axios will do this automatically.
                dto = dtos[dto_class_name](**request.json)
            else:
                req_body = request.form.get("body", default=None)
                if req_body is None:
                    return jsonify({"error": "Missing body"}), 400
                req = json.loads(req_body)
                req["file"] = request.files.get("file", default=None)
                dto = dtos[dto_class_name](**req)
            error_message = dto.validate()
            if error_message:
                return (
                    jsonify({"error": error_message}),
                    400,
                )
            return api_func(*args, **kwargs)

        return wrapper

    return validate_dto
