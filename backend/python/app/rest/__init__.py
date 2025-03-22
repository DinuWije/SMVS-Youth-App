def init_app(app):
    from . import (
        user_routes,
        auth_routes,
        entity_routes,
        simple_entity_routes,
        documentation_routes,
        article_routes,
        feed_routes,
        quiz_routes,
        quiz_completion_routes,
        reflection_routes,
    )

    app.register_blueprint(user_routes.blueprint)
    app.register_blueprint(auth_routes.blueprint)
    app.register_blueprint(entity_routes.blueprint)
    app.register_blueprint(simple_entity_routes.blueprint)
    app.register_blueprint(documentation_routes.blueprint)
    app.register_blueprint(article_routes.blueprint)
    app.register_blueprint(feed_routes.blueprint)
    app.register_blueprint(quiz_routes.blueprint)
    app.register_blueprint(quiz_completion_routes.blueprint)
    app.register_blueprint(reflection_routes.blueprint)
