import os

from flask import Blueprint, current_app, jsonify, request

from ..middlewares.auth import require_authorization_by_role
from ..middlewares.validate import validate_request
from ..resources.feed_dto import FeedDTO
from ..services.implementations.feed_service import FeedService

# Initialize the feed service
feed_service = FeedService(current_app.logger)

# Define the Blueprint for feeds
blueprint = Blueprint("feeds", __name__, url_prefix="/feeds")


# @blueprint.route("/", methods=["GET"], strict_slashes=False)
# @require_authorization_by_role({"User", "Admin"})
# def get_feeds():
#     """
#     Get all feed posts
#     """
#     try:
#         feeds = feed_service.get_entities()
#         return jsonify([feed for feed in feeds]), 200
#     except Exception as e:
#         error_message = getattr(e, "message", None)
#         return jsonify({"error": error_message if error_message else str(e)}), 500


@blueprint.route("/", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_feeds():
    """
    Get all feed posts or filter by location if provided.
    """
    try:
        location = request.args.get("location")  # Get the location from query params

        if location:
            # If a location is provided, filter feeds by location
            feeds = feed_service.get_feeds_by_location(location)
        else:
            # Otherwise, return all feeds
            feeds = feed_service.get_entities()

        return jsonify([feed for feed in feeds]), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500



@blueprint.route("/<int:feed_id>", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_feed(feed_id):
    """
    Get a single feed post by ID
    """
    try:
        feed = feed_service.get_entity(feed_id)
        return jsonify(feed), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500


@blueprint.route("/", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("FeedDTO")
def create_feed():
    """
    Create a new feed post
    """
    try:
        feed = FeedDTO(**request.json)
        created_feed = feed_service.create_feed_post(feed)
        return jsonify(created_feed), 201
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500


@blueprint.route("/<int:feed_id>", methods=["PUT"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("FeedDTO")
def update_feed(feed_id):
    """
    Update an existing feed post
    """
    try:
        feed = FeedDTO(**request.json)
        updated_feed = feed_service.update_entity(feed_id, feed)
        return jsonify(updated_feed), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500


@blueprint.route("/<int:feed_id>", methods=["DELETE"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def delete_feed(feed_id):
    """
    Delete a feed post by ID
    """
    console.log("deleting?")
    try:
        deleted_id = feed_service.delete_entity(feed_id)
        return jsonify({"message": f"Feed post {deleted_id} deleted successfully"}), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500

@blueprint.route("/<int:feed_id>/comment", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def add_comment(feed_id):
    """
    Add a comment to a feed post and update the comment count.
    """
    try:
        data = request.json
        user_id = data.get("user_id")
        content = data.get("content")
        parent_id = data.get("parent_id")  # Optional for threaded comments

        if not user_id or not content:
            return jsonify({"error": "User ID and content are required"}), 400

        updated_feed = feed_service.add_comment(feed_id, user_id, content, parent_id)
        return jsonify(updated_feed), 201
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500

@blueprint.route("/<int:feed_id>/comments", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_feed_comments(feed_id):
    """
    Get all comments for a specific feed post.
    """
    try:
        comments = feed_service.get_comments_for_feed(feed_id)
        return jsonify(comments), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500


@blueprint.route("/<int:feed_id>/like", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def add_like(feed_id):
    """
    Add a like to a feed post.
    """
    try:
        user_id = request.json.get("user_id")
        updated_feed = feed_service.add_like(feed_id, user_id)
        return jsonify(updated_feed), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500


@blueprint.route("/<int:feed_id>/view", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def increment_view(feed_id):
    """
    Increment the view count of a feed post.
    """
    try:
        updated_feed = feed_service.increment_view_count(feed_id)
        return jsonify(updated_feed), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500

@blueprint.route("/<int:feed_id>/unlike", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def remove_like(feed_id):
    """
    Remove a like from a feed post.
    """
    try:
        user_id = request.json.get("user_id")
        updated_feed = feed_service.remove_like(feed_id, user_id)
        return jsonify(updated_feed), 200
    except Exception as e:
        error_message = getattr(e, "message", None)
        return jsonify({"error": error_message if error_message else str(e)}), 500
