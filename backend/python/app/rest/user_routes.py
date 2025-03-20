from datetime import datetime, timedelta
import os

from flask import Blueprint, current_app, jsonify, request

from ..middlewares.auth import require_authorization_by_role
from ..middlewares.validate import validate_request
from ..resources.create_user_dto import CreateUserDTO
from ..resources.update_user_dto import UpdateUserDTO
from ..resources.email_users_dto import EmailUsersDTO
from ..resources.create_progress_dto import CreateProgressDTO
from ..services.implementations.auth_service import AuthService
from ..services.implementations.email_service import EmailService
from ..services.implementations.user_service import UserService
from ..utilities.csv_utils import generate_csv_from_list


email_service = EmailService(
    current_app.logger,
    {
        "refresh_token": os.getenv("MAILER_REFRESH_TOKEN"),
        "token_uri": "https://oauth2.googleapis.com/token",
        "client_id": os.getenv("MAILER_CLIENT_ID"),
        "client_secret": os.getenv("MAILER_CLIENT_SECRET"),
    },
    os.getenv("MAILER_USER"),
    "SMVS Youth App",  # must replace
)
user_service = UserService(current_app.logger, email_service)
auth_service = AuthService(current_app.logger, user_service, email_service)
blueprint = Blueprint("users", __name__, url_prefix="/users")

DEFAULT_CSV_OPTIONS = {
    "header": True,
    "flatten_lists": True,
    "flatten_objects": False,
}


@blueprint.route("/", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_users():
    """
    Get all users, optionally filter by a user_id or email query parameter to retrieve a single user
    """
    user_id = request.args.get("user_id")
    email = request.args.get("email")
    content_type = request.mimetype

    if user_id and email:
        return jsonify({"error": "Cannot query by both user_id and email"}), 400

    if not (user_id or email):
        try:
            users = user_service.get_users()

            if content_type == "text/csv":
                return (
                    jsonify(
                        generate_csv_from_list(
                            [user.__dict__ for user in users], **DEFAULT_CSV_OPTIONS
                        )
                    ),
                    200,
                )

            return jsonify(list(map(lambda user: user.__dict__, users))), 200
        except Exception as e:
            error_message = getattr(e, "message", None)
            return jsonify({"error": (error_message if error_message else str(e))}), 500

    if user_id:
        if type(user_id) is not str:
            return jsonify({"error": "user_id query parameter must be a string"}), 400
        else:
            try:
                user = user_service.get_user_by_id(user_id)
                return jsonify([user.__dict__]), 200
            except Exception as e:
                error_message = getattr(e, "message", None)
                return (
                    jsonify({"error": (error_message if error_message else str(e))}),
                    500,
                )

    if email:
        if type(email) is not str:
            return jsonify({"error": "email query parameter must be a string"}), 400
        else:
            try:
                user = user_service.get_user_by_email(email)
                return jsonify([user.__dict__]), 200
            except Exception as e:
                error_message = getattr(e, "message", None)
                return (
                    jsonify({"error": (error_message if error_message else str(e))}),
                    500,
                )


@blueprint.route("/", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("CreateUserDTO")
def create_user():
    """
    Create a user
    """
    try:
        user = CreateUserDTO(**request.json)
        created_user = user_service.create_user(user)
        auth_service.send_email_verification_link(request.json["email"])
        return jsonify(created_user.__dict__), 201
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": (error_message if error_message else str(e))}), 500


@blueprint.route("/<int:user_id>", methods=["PUT"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("UpdateUserDTO")
def update_user(user_id):
    """
    Update the user with the specified user_id
    """
    try:
        user = UpdateUserDTO(**request.json)
        updated_user = user_service.update_user_by_id(user_id, user)
        return jsonify(updated_user.__dict__), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": (error_message if error_message else str(e))}), 500


@blueprint.route("/", methods=["DELETE"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def delete_user():
    """
    Delete a user by user_id or email, specified through a query parameter
    """
    user_id = request.args.get("user_id")
    email = request.args.get("email")

    if user_id and email:
        return jsonify({"error": "Cannot delete by both user_id and email"}), 400

    if user_id:
        if type(user_id) is not str:
            return jsonify({"error": "user_id query parameter must be a string"}), 400
        else:
            try:
                user_service.delete_user_by_id(user_id)
                return "", 204
            except Exception as e:
                error_message = getattr(e, "message", None)
                return (
                    jsonify({"error": (error_message if error_message else str(e))}),
                    500,
                )

    if email:
        if type(email) is not str:
            return jsonify({"error": "email query parameter must be a string"}), 400
        else:
            try:
                user_service.delete_user_by_email(email)
                return "", 204
            except Exception as e:
                error_message = getattr(e, "message", None)
                return (
                    jsonify({"error": (error_message if error_message else str(e))}),
                    500,
                )

    return (
        jsonify({"error": "Must supply one of user_id or email as query parameter."}),
        400,
    )


@blueprint.route("/send_email_notifs", methods=["POST"], strict_slashes=False)
@require_authorization_by_role("Admin")
def send_email_notifs():
    """
    Email users with notifs_enabled=True, optionally filtered by location.
    """
    try:
        email_info = EmailUsersDTO(**request.json)
        location = request.json.get("location")  # Extract location if provided

        if location:
            # Get users filtered by location
            users_in_location = user_service.get_users_by_location(location)

            if not users_in_location:
                return jsonify({"error": f"No users found in location: {location}"}), 404
            
            # Send emails only to users in the specified location
            user_service.email_users_in_location(users_in_location, email_info.subject, email_info.body)
        else:
            # Default behavior: email all users if no location is provided
            user_service.email_all_users(email_info.subject, email_info.body)

        return "", 204
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": (error_message if error_message else str(e))}), 500


@blueprint.route("/update_progress", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def upgrade_progress():
    """
    Add an item to the progress table for the user
    """
    try:
        progress = CreateProgressDTO(**request.json)
        progress_dict = {
            "user_id": progress.user_id,
            "content_type": progress.content_type,
            "points_collected": progress.points_collected
        }
        created_progress = user_service.update_progress(progress_dict)
        return jsonify(created_progress.__dict__), 201
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": (error_message if error_message else str(e))}), 500
    
@blueprint.route("/get_points_by_date", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_points_by_date():
    """
    Retrieve progress points for a user filtered by date range
    """
    try:
        # Get query parameters
        user_id = request.args.get("user_id")
        start_date = request.args.get("start_date")
        end_date = request.args.get("end_date")
        
        # Validate required parameters
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
            
        # Convert dates if provided
        date_params = {}
        if start_date:
            try:
                date_params["start_date"] = datetime.strptime(start_date, "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
                
        if end_date:
            try:
                date_params["end_date"] = datetime.strptime(end_date, "%Y-%m-%d")
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        # Call service method with parameters
        progress_points = user_service.get_points_by_date(user_id, **date_params)
             # Use to_dict() method on each Progress object to make it serializable
        serialized_points = [p.to_dict() for p in progress_points]
        points_sum = sum(p["points_collected"] for p in serialized_points)

        # Return results
        return jsonify(serialized_points), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": (error_message if error_message else str(e))}), 500
    
@blueprint.route("/delete_progress", methods=["DELETE"], strict_slashes=False)
@require_authorization_by_role({"Admin", "User"})  # Restrict to admins for safety
def delete_user_progress():
    """
    Delete all progress entries for a given user
    """
    try:
        # Get user_id from query parameters
        user_id = request.args.get("user_id")
        
        # Validate required parameters
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
            
        # Call service method
        deleted_count = user_service.delete_progress(user_id)
        
        # Return success response with count of deleted records
        return jsonify({"message": f"Successfully deleted {deleted_count} progress records"}), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": (error_message if error_message else str(e))}), 500