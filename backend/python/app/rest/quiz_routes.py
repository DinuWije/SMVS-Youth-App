from flask import Blueprint, current_app, request, jsonify

from ..middlewares.auth import require_authorization_by_role
from ..middlewares.validate import validate_request
from ..services.implementations.quiz_service import QuizService
from ..resources.quiz_dto import QuizDTO

quiz_service = QuizService(current_app.logger)

blueprint = Blueprint("quiz", __name__, url_prefix="/quizzes")


@blueprint.route("/", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_quizzes():
    try:
        result = quiz_service.get_all_quizzes()
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving quizzes: {str(e)}")
        return jsonify({"error": "Failed to retrieve quizzes"}), 500


@blueprint.route("/<int:id>", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_quiz(id):
    try:
        result = quiz_service.get_quiz_by_id(id)
        if not result:
            return jsonify({"error": "Quiz not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving quiz {id}: {str(e)}")
        return jsonify({"error": "Failed to retrieve quiz"}), 500


@blueprint.route("/article/<int:article_id>", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_quiz_by_article(article_id):
    try:
        result = quiz_service.get_quiz_by_article_id(article_id)
        if not result:
            return jsonify({"error": "Quiz not found for this article"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving quiz for article {article_id}: {str(e)}")
        return jsonify({"error": "Failed to retrieve quiz for this article"}), 500


@blueprint.route("/", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("QuizDTO")
def create_quiz():
    try:
        body = request.json
        quiz_dto = QuizDTO(**body)
        errors = quiz_dto.validate()
        if errors:
            return jsonify({"errors": errors}), 400

        result = quiz_service.create_quiz(quiz_dto.to_dict())
        return jsonify(result), 201
    except ValueError as e:
        current_app.logger.error(f"Validation error creating quiz: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error creating quiz: {str(e)}")
        return jsonify({"error": "Failed to create quiz"}), 500


@blueprint.route("/<int:id>", methods=["PUT"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("QuizDTO")
def update_quiz(id):
    try:
        body = request.json
        quiz_dto = QuizDTO(**body)
        errors = quiz_dto.validate()
        if errors:
            return jsonify({"errors": errors}), 400 

        result = quiz_service.update_quiz(id, quiz_dto.to_dict())
        if not result:
            return jsonify({"error": "Quiz not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error updating quiz {id}: {str(e)}")
        return jsonify({"error": "Failed to update quiz"}), 500


@blueprint.route("/<int:id>", methods=["DELETE"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def delete_quiz(id):
    try:
        success = quiz_service.delete_quiz(id)
        if not success:
            return jsonify({"error": "Quiz not found"}), 404
        return jsonify({"message": "Quiz deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting quiz {id}: {str(e)}")
        return jsonify({"error": "Failed to delete quiz"}), 500
