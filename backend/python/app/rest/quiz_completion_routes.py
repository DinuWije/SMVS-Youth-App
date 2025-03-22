from flask import Blueprint, current_app, request, jsonify
from ..services.implementations.quiz_completion_service import QuizCompletionService
from ..middlewares.auth import require_authorization_by_role
from ..middlewares.validate import validate_request

quiz_completion_service = QuizCompletionService(current_app.logger)
blueprint = Blueprint("quiz_completions", __name__, url_prefix="/quizzes/completions")

@blueprint.route("/", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def record_completion():
    try:
        body = request.json
        result = quiz_completion_service.record_completion(
            body["user_id"],
            body["quiz_id"],
            body["article_id"],
            body["score"]
        )
        return jsonify(result), 201
    except Exception as e:
        current_app.logger.error(f"Error recording quiz completion: {str(e)}")
        return jsonify({"error": "Failed to record quiz completion"}), 500

@blueprint.route("/user/<int:user_id>", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_user_completions(user_id):
    try:
        result = quiz_completion_service.get_user_completions(user_id)
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error getting user quiz completions: {str(e)}")
        return jsonify({"error": "Failed to get user quiz completions"}), 500

@blueprint.route("/check", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def check_completion():
    try:
        user_id = request.args.get("user_id")
        article_id = request.args.get("article_id")
        
        if not user_id or not article_id:
            return jsonify({"error": "User ID and article ID are required"}), 400
            
        result = quiz_completion_service.check_completion(int(user_id), int(article_id))
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error checking quiz completion: {str(e)}")
        return jsonify({"error": "Failed to check quiz completion"}), 500

@blueprint.route("/<int:completion_id>", methods=["DELETE"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def delete_completion(completion_id):
    try:
        success = quiz_completion_service.delete_completion(completion_id)
        if not success:
            return jsonify({"error": "Completion record not found"}), 404
        return jsonify({"message": "Completion record deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting completion {completion_id}: {str(e)}")
        return jsonify({"error": "Failed to delete completion record"}), 500
