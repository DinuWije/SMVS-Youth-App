from flask import Blueprint, current_app, request, jsonify

from ..services.implementations.reflection_service import ReflectionService
from ..resources.reflection_dto import ReflectionDTO, ReflectionPromptDTO, AiResponseDTO

reflection_service = ReflectionService(current_app.logger)

blueprint = Blueprint("reflection", __name__, url_prefix="/reflections")


@blueprint.route("/", methods=["GET"], strict_slashes=False)
def get_reflections():
    try:
        # Get user_id from query parameters
        user_id = request.args.get("user_id", 1, type=int)
        result = reflection_service.get_all_reflections(user_id)
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving reflections: {str(e)}")
        return jsonify({"error": "Failed to retrieve reflections"}), 500


@blueprint.route("/recent", methods=["GET"], strict_slashes=False)
def get_recent_reflections():
    try:
        # Get user_id from query parameters
        user_id = request.args.get("user_id", 1, type=int)
        limit = request.args.get("limit", 5, type=int)
        result = reflection_service.get_recent_reflections(user_id, limit)
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving recent reflections: {str(e)}")
        return jsonify({"error": "Failed to retrieve reflections"}), 500


@blueprint.route("/<int:id>", methods=["GET"], strict_slashes=False)
def get_reflection(id):
    try:
        # Get user_id from query parameters
        user_id = request.args.get("user_id", 1, type=int)
        result = reflection_service.get_reflection_by_id(id, user_id)
        if not result:
            return jsonify({"error": "Reflection not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving reflection {id}: {str(e)}")
        return jsonify({"error": "Failed to retrieve reflection"}), 500


@blueprint.route("/", methods=["POST"], strict_slashes=False)
def create_reflection():
    try:
        body = request.json
        
        # Extract user_id from request body
        user_id = body.get("user_id", 1)
        
        reflection_dto = ReflectionDTO(**body)
        errors = reflection_dto.validate()
        if errors:
            return jsonify({"errors": errors}), 400

        # Create the reflection first
        reflection_data = reflection_dto.to_dict()
        
        # Generate AI response if not provided
        if not reflection_data.get("ai_response"):
            ai_response = reflection_service.generate_ai_response(
                reflection_data["user_reflection"], 
                reflection_data["reflection_type"]
            )
            reflection_data["ai_response"] = ai_response
        
        result = reflection_service.create_reflection(reflection_data)
        return jsonify(result), 201
    except Exception as e:
        current_app.logger.error(f"Error creating reflection: {str(e)}")
        return jsonify({"error": "Failed to create reflection"}), 500


@blueprint.route("/<int:id>", methods=["PUT"], strict_slashes=False)
def update_reflection(id):
    try:
        body = request.json
        user_id = body.get("user_id", 1)
        
        reflection_dto = ReflectionDTO(**body)
        errors = reflection_dto.validate()
        if errors:
            return jsonify({"errors": errors}), 400

        result = reflection_service.update_reflection(id, reflection_dto.to_dict(), user_id)
        if not result:
            return jsonify({"error": "Reflection not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error updating reflection {id}: {str(e)}")
        return jsonify({"error": "Failed to update reflection"}), 500


@blueprint.route("/<int:id>", methods=["DELETE"], strict_slashes=False)
def delete_reflection(id):
    try:
        user_id = request.args.get("user_id", 1, type=int)
        success = reflection_service.delete_reflection(id, user_id)
        if not success:
            return jsonify({"error": "Reflection not found"}), 404
        return jsonify({"message": "Reflection deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting reflection {id}: {str(e)}")
        return jsonify({"error": "Failed to delete reflection"}), 500


@blueprint.route("/<int:id>/save", methods=["POST"], strict_slashes=False)
def save_reflection(id):
    try:
        # Try to get user_id from request body first, then from query parameters
        body = request.json or {}
        user_id = body.get("user_id") or request.args.get("user_id", 1, type=int)
            
        result = reflection_service.save_reflection(id, user_id)
        if not result:
            return jsonify({"error": "Reflection not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error saving reflection {id}: {str(e)}")
        return jsonify({"error": "Failed to save reflection"}), 500


@blueprint.route("/prompt", methods=["POST"], strict_slashes=False)
def get_reflection_prompt():
    try:
        body = request.json
        
        # No need to validate user_id here, just get the reflection type
        reflection_type = body.get("reflection_type")
        if not reflection_type:
            return jsonify({"error": "reflection_type is required"}), 400

        prompt = reflection_service.get_reflection_prompt(reflection_type)
        return jsonify({"prompt": prompt}), 200
    except Exception as e:
        current_app.logger.error(f"Error generating prompt: {str(e)}")
        return jsonify({"error": "Failed to generate prompt"}), 500


@blueprint.route("/ai-response", methods=["POST"], strict_slashes=False)
def generate_ai_response():
    try:
        body = request.json
        
        # Extract necessary fields
        user_reflection = body.get("user_reflection")
        reflection_type = body.get("reflection_type")
        reflection_id = body.get("reflection_id")
        user_id = body.get("user_id", 1)
        
        if not user_reflection:
            return jsonify({"error": "user_reflection is required"}), 400
        if not reflection_type:
            return jsonify({"error": "reflection_type is required"}), 400

        ai_response = reflection_service.generate_ai_response(
            user_reflection, 
            reflection_type
        )
        
        # If there's a reflection_id, update the existing reflection
        if reflection_id:
            reflection_service.update_reflection(
                reflection_id,
                {"ai_response": ai_response},
                user_id
            )
        
        print("HEREEEEEE")
        return jsonify({"ai_response": ai_response}), 200
    except Exception as e:
        current_app.logger.error(f"Error generating AI response: {str(e)}")
        return jsonify({"error": "Failed to generate AI response"}), 500
