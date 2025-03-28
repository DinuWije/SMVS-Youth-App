from datetime import timedelta
import firebase_admin.auth

from ..interfaces.user_service import IUserService
from ...models.user import User
from ...models.progress import Progress
from ...models import db
from ...resources.user_dto import UserDTO
from ...resources.progress_dto import ProgressDTO


class UserService(IUserService):
    """
    UserService implementation with user management methods
    """

    def __init__(self, logger, email_service):
        """
        Create an instance of UserService

        :param logger: application's logger instance
        :type logger: logger
        """
        self.logger = logger
        self.email_service = email_service

    def get_user_by_id(self, user_id):
        try:
            user = User.query.get(user_id)

            if not user:
                raise Exception("user_id {user_id} not found".format(user_id))

            firebase_user = firebase_admin.auth.get_user(user.auth_id)

            user_dict = UserService.__user_to_dict_and_remove_unused(user)
            user_dict["email"] = firebase_user.email
            return UserDTO(**user_dict)
        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to get user. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def get_user_by_email(self, email):
        try:
            firebase_user = firebase_admin.auth.get_user_by_email(email)
            user = User.query.filter_by(auth_id=firebase_user.uid).first()

            if not user:
                raise Exception(
                    "user with auth_id {auth_id} not found".format(
                        auth_id=firebase_user.uid
                    )
                )

            user_dict = UserService.__user_to_dict_and_remove_unused(user)
            user_dict["email"] = firebase_user.email

            return UserDTO(**user_dict)
        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to get user. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def get_user_role_by_auth_id(self, auth_id):
        try:
            user = self.__get_user_by_auth_id(auth_id)
            return user.role
        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to get user role. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def get_user_id_by_auth_id(self, auth_id):
        try:
            user = self.__get_user_by_auth_id(auth_id)
            return str(user.id)
        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to get user id. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def get_auth_id_by_user_id(self, user_id):
        try:
            user = User.query.get(user_id)

            if not user:
                raise Exception("user_id {user_id} not found".format(user_id=user_id))

            return user.auth_id
        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "failed to get auth_id. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def get_users(self):
        user_dtos = []
        user_list = [result for result in User.query.all()]
        for user in user_list:
            user_dict = UserService.__user_to_dict_and_remove_unused(user)
            try:
                firebase_user = firebase_admin.auth.get_user(user.auth_id)
                user_dict["email"] = firebase_user.email
                user_dtos.append(UserDTO(**user_dict))
            except Exception as e:
                self.logger.error(
                    "User with auth_id {auth_id} could not be fetched from Firebase".format(
                        auth_id=user.auth_id
                    )
                )
                raise e

        return user_dtos

    def create_user(self, user, auth_id=None, signup_method="PASSWORD"):
        new_user = None
        firebase_user = None

        try:
            if signup_method == "PASSWORD":
                firebase_user = firebase_admin.auth.create_user(
                    email=user.email, password=user.password
                )
            elif signup_method == "GOOGLE":
                # If they signup with Google OAuth, a Firebase user is automatically created
                firebase_user = firebase_admin.auth.get_user(uid=auth_id)

            postgres_user = {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "auth_id": firebase_user.uid,
                "email_address": user.email,
                "role": user.role,
            }

            try:
                new_user = User(**postgres_user)
                db.session.add(new_user)
                db.session.commit()
            except Exception as postgres_error:
                # rollback user creation in Firebase
                try:
                    firebase_admin.auth.delete_user(firebase_user.uid)
                except Exception as firebase_error:
                    reason = getattr(firebase_error, "message", None)
                    error_message = [
                        "Failed to rollback Firebase user creation after PostgreSQL user creation failed.",
                        "Reason = {reason},".format(
                            reason=(reason if reason else str(firebase_error))
                        ),
                        "Orphaned auth_id (Firebase uid) = {auth_id}".format(
                            auth_id=firebase_user.uid
                        ),
                    ]
                    self.logger.error(" ".join(error_message))
                raise postgres_error

        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to create user. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

        new_user_dict = UserService.__user_to_dict_and_remove_unused(new_user)
        new_user_dict["email"] = firebase_user.email
        return UserDTO(**new_user_dict)

    def update_user_by_id(self, user_id, user):
        try:
            old_user = User.query.get(user_id)

            if not old_user:
                raise Exception("user_id {user_id} not found".format(user_id=user_id))

            User.query.filter_by(id=user_id).update(
                {
                    User.first_name: user.first_name,
                    User.last_name: user.last_name,
                    User.role: user.role,
                    User.email_address: user.email,
                    User.phone_number: user.phone_number,
                    User.location: user.location,
                    User.interests: user.interests,
                    User.allow_notifs: user.allow_notifs,
                }
            )

            db.session.commit()

            try:
                firebase_admin.auth.update_user(old_user.auth_id, email=user.email)
            except Exception as firebase_error:
                try:
                    old_user_dict = {
                        User.first_name: old_user.first_name,
                        User.last_name: old_user.last_name,
                        User.role: old_user.role,
                        User.email_address: old_user.email_address,
                        User.phone_number: old_user.phone_number,
                        User.location: old_user.location,
                        User.interests: old_user.interests,
                        User.allow_notifs: old_user.allow_notifs,
                    }
                    User.query.filter_by(id=user_id).update(**old_user_dict)
                    db.session.commit()

                except Exception as postgres_error:
                    reason = getattr(postgres_error, "message", None)
                    error_message = [
                        "Failed to rollback Postgres user update after Firebase user update failure.",
                        "Reason = {reason},".format(
                            reason=(reason if reason else str(postgres_error))
                        ),
                        "Postgres user id with possibly inconsistent data = {user_id}".format(
                            user_id=user_id
                        ),
                    ]
                    self.logger.error(" ".join(error_message))

                raise firebase_error

        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to update user. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

        return UserDTO(user_id, user.first_name, user.last_name, user.email, user.role, user.phone_number, user.location, user.interests, user.allow_notifs)

    def delete_user_by_id(self, user_id):
        try:
            deleted_user = User.query.get(user_id)

            if not deleted_user:
                raise Exception("user_id {user_id} not found".format(user_id=user_id))

            delete_count = User.query.filter_by(id=user_id).delete(
                synchronize_session="fetch"
            )

            if delete_count < 1:
                raise Exception(
                    "user_id {user_id} was not deleted".format(user_id=user_id)
                )
            elif delete_count > 1:
                raise Exception(
                    "user_id {user_id} had multiple instances. Delete not committed.".format(
                        user_id=user_id
                    )
                )

            db.session.commit()

            try:
                firebase_admin.auth.delete_user(deleted_user.auth_id)
            except Exception as firebase_error:
                # rollback Postgres user deletion
                try:
                    deleted_user_dict = {
                        "first_name": deleted_user.first_name,
                        "last_name": deleted_user.last_name,
                        "auth_id": deleted_user.auth_id,
                        "role": deleted_user.role,
                    }

                    new_user = User(**deleted_user_dict)
                    db.session.add(new_user)
                    db.session.commit()

                except Exception as postgres_error:
                    reason = getattr(postgres_error, "message", None)
                    error_message = [
                        "Failed to rollback Postgres user deletion after Firebase user deletion failure.",
                        "Reason = {reason},".format(
                            reason=(reason if reason else str(postgres_error)),
                        ),
                        "Firebase uid with non-existent Postgres record ={auth_id}".format(
                            auth_id=deleted_user.auth_id
                        ),
                    ]
                    self.logger.error(" ".join(error_message))

                raise firebase_error

        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to delete user. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def delete_user_by_email(self, email):
        try:
            firebase_user = firebase_admin.auth.get_user_by_email(email)
            deleted_user = User.query.filter_by(auth_id=firebase_user.uid).first()

            if not deleted_user:
                raise Exception(
                    "auth_id (Firebase uid) {auth_id} not found".format(
                        auth_id=firebase_user.uid
                    )
                )

            delete_count = User.query.filter_by(auth_id=firebase_user.uid).delete(
                synchronize_session="fetch"
            )

            if delete_count < 1:
                raise Exception(
                    "user_id {user_id} was not deleted".format(user_id=user_id)
                )
            elif delete_count > 1:
                raise Exception(
                    "user_id {user_id} had multiple instances. Delete not committed.".format(
                        user_id=user_id
                    )
                )

            db.session.commit()

            try:
                firebase_admin.auth.delete_user(firebase_user.uid)
            except Exception as firebase_error:
                try:
                    deleted_user_dict = {
                        "first_name": deleted_user.first_name,
                        "last_name": deleted_user.last_name,
                        "auth_id": deleted_user.auth_id,
                        "role": deleted_user.role,
                    }
                    new_user = User(**deleted_user_dict)
                    db.session.add(new_user)
                    db.session.commit()

                except Exception as postgres_error:
                    reason = getattr(postgres_error, "message", None)
                    error_message = [
                        "Failed to rollback Postgres user deletion after Firebase user deletion failure.",
                        "Reason = {reason},".format(
                            reason=(reason if reason else str(postgres_error))
                        ),
                        "Firebase uid with non-existent Postgres record = {auth_id}".format(
                            auth_id=deleted_user.auth_id
                        ),
                    ]
                    self.logger.error(" ".join(error_message))

                raise firebase_error

        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to delete user. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def __get_user_by_auth_id(self, auth_id):
        """
        Get a user document by auth_id

        :param auth_id: the user's auth_id (Firebase uid)
        :type auth_id: str
        """
        user = User.query.filter_by(auth_id=auth_id).first()

        if not user:
            raise Exception(
                "user with auth_id {auth_id} not found".format(auth_id=auth_id)
            )

        return user

    @staticmethod
    def __user_to_dict_and_remove_unused(user):
        """
        Convert a User document to a serializable dict and remove the
        auth id field

        :param user: the user
        :type user: User
        """
        user_dict = user.to_dict()
        user_dict.pop("auth_id", None)
        user_dict.pop("email_address", None)
        # user_dict.pop("phone_number", None)
        # user_dict.pop("location", None)
        # user_dict.pop("interests", None)
        # user_dict.pop("allow_notifs", None)
        return user_dict
    

    def email_all_users(self, subject, body):
        users_with_notifs = User.query.filter_by(allow_notifs=True).all()
        email_list = [user.email_address for user in users_with_notifs]
        for email in email_list:
            try:
                self.email_service.send_email(email, subject, body)
            except Exception as e:
                self.logger.error(
                    "Failed to send email to user with email {email}".format(
                        email=email
                    )
                )
                raise e

        return

    def get_users_by_location(self, location):
        """
        Retrieve users with notifs_enabled=True in the specified location.
        
        :param location: The location to filter users by
        :type location: str
        :return: List of users in the specified location
        :rtype: list[User]
        """
        try:
            users_in_location = User.query.filter_by(location=location, allow_notifs=True).all()
            return users_in_location
        except Exception as e:
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to retrieve users by location. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def email_users_in_location(self, users, subject, body):
        """
        Send emails to users in a specified location.

        :param users: List of users to email
        :type users: list[User]
        :param subject: Email subject
        :type subject: str
        :param body: Email body
        :type body: str
        """
        email_list = [user.email_address for user in users]
        for email in email_list:
            try:
                self.email_service.send_email(email, subject, body)
            except Exception as e:
                self.logger.error(
                    "Failed to send email to user with email {email}".format(email=email)
                )
                raise e
    
    def update_progress(self, progress_item):
        new_progress = None
        try:
            new_progress = Progress(**progress_item)
            print(new_progress)
            db.session.add(new_progress)
            db.session.commit()
        except Exception as postgres_error:
            raise postgres_error

        return ProgressDTO(**new_progress.to_dict())
    
    def delete_progress(self, user_id):
        try:
            # Verify the user exists
            user = User.query.get(user_id)
            if not user:
                raise Exception(f"user_id {user_id} not found")
                
            # Delete all progress records for this user
            delete_count = Progress.query.filter_by(user_id=user_id).delete(
                synchronize_session="fetch"
            )
            
            # Commit the transaction
            db.session.commit()
            
            # Log the deletion
            self.logger.info(
                f"Deleted {delete_count} progress records for user_id {user_id}"
            )
            
            return delete_count
            
        except Exception as e:
            # Rollback in case of error
            db.session.rollback()
            
            reason = getattr(e, "message", None)
            self.logger.error(
                "Failed to delete progress records. Reason = {reason}".format(
                    reason=(reason if reason else str(e))
                )
            )
            raise e

    def get_points_by_date(self, user_id, start_date=None, end_date=None):
        # Start with base query to filter by user_id
        query = Progress.query.filter_by(user_id=user_id)
        
        # Add date range filters if provided
        if start_date:
            query = query.filter(Progress.date >= start_date)
        
        if end_date:
            # Add 1 day to end_date to include the entire end date
            end_date_inclusive = end_date + timedelta(days=1)
            query = query.filter(Progress.date < end_date_inclusive)
        
        # Execute query and return results
        progress_records = query.all()
        
        if not progress_records:
            # Return empty list instead of raising exception if no records found
            return []
            
        return progress_records
    
