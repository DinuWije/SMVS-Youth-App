from flask import current_app
import pytest

from app.models.user import User
from app.services.implementations.user_service import UserService

from app.models import db

"""
Sample python test.
For more information on pytest, visit:
https://docs.pytest.org/en/6.2.x/reference.html
"""


@pytest.fixture(scope="module", autouse=True)
def setup(module_mocker):
    module_mocker.patch(
        "app.services.implementations.auth_service.AuthService.is_authorized_by_role",
        return_value=True,
    )
    module_mocker.patch("firebase_admin.auth.get_user", return_value=FirebaseUser())


@pytest.fixture
def user_service():
    user_service = UserService(current_app.logger, None)
    yield user_service
    User.query.delete()


TEST_USERS = (
    {
        "auth_id": "A",
        "first_name": "Jane",
        "last_name": "Doe",
        "role": "Admin",
        "email_address": "test@test.com",
    },
    {
        "auth_id": "B",
        "first_name": "Hello",
        "last_name": "World",
        "role": "User",
        "email_address": "test@test.com",
    },
)


class FirebaseUser:
    """
    Mock returned firebase user
    """

    def __init__(self):
        self.email = "test@test.com"


def get_expected_user(user):
    """
    Remove auth_id field from user and sets email field.
    """
    expected_user = user.copy()
    expected_user["email"] = "test@test.com"
    expected_user.pop("auth_id", None)
    return expected_user


def insert_users():
    user_instances = [User(**data) for data in TEST_USERS]
    db.session.bulk_save_objects(user_instances)
    db.session.commit()


def assert_returned_users(users, expected):
    for expected_user, actual_user in zip(expected, users):
        for key in expected[0].keys():
            assert expected_user[key] == actual_user[key]
