from flask import Blueprint, current_app, request, jsonify

from ..middlewares.auth import require_authorization_by_role
from ..middlewares.validate import validate_request
from ..services.implementations.article_service import ArticleService
from ..resources.article_dto import ArticleDTO

article_service = ArticleService(current_app.logger)

blueprint = Blueprint("article", __name__, url_prefix="/articles")


@blueprint.route("/", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_articles():
    try:
        result = article_service.get_all_articles()
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving articles: {str(e)}")
        return jsonify({"error": "Failed to retrieve articles"}), 500


@blueprint.route("/<int:id>", methods=["GET"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def get_article(id):
    try:
        result = article_service.get_article_by_id(id, include_relationships=True)
        if not result:
            return jsonify({"error": "Article not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error retrieving article {id}: {str(e)}")
        return jsonify({"error": "Failed to retrieve article"}), 500

@blueprint.route("/", methods=["POST"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("ArticleDTO")
def create_article():
    try:
        body = request.json
        article_dto = ArticleDTO(**body)
        errors = article_dto.validate()
        if errors:
            return jsonify({"errors": errors}), 400

        result = article_service.create_article(article_dto.to_dict())
        return jsonify(result), 201
    except Exception as e:
        current_app.logger.error(f"Error creating article: {str(e)}")
        return jsonify({"error": "Failed to create article"}), 500


@blueprint.route("/<int:id>", methods=["PUT"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
@validate_request("ArticleDTO")
def update_article(id):
    try:
        body = request.json
        article_dto = ArticleDTO(**body)
        errors = article_dto.validate()
        if errors:
            return jsonify({"errors": errors}), 400 

        result = article_service.update_article(id, article_dto.to_dict())
        if not result:
            return jsonify({"error": "Article not found"}), 404
        return jsonify(result), 200
    except Exception as e:
        current_app.logger.error(f"Error updating article {id}: {str(e)}")
        return jsonify({"error": "Failed to update article"}), 500


@blueprint.route("/<int:id>", methods=["DELETE"], strict_slashes=False)
@require_authorization_by_role({"User", "Admin"})
def delete_article(id):
    try:
        success = article_service.delete_article(id)
        if not success:
            return jsonify({"error": "Article not found"}), 404
        return jsonify({"message": "Article deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting article {id}: {str(e)}")
        return jsonify({"error": "Failed to delete article"}), 500
