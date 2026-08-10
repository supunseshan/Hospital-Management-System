"""
Initializes the Firebase Admin SDK once for the whole app.

Firestore is used as the system's database (Patients, Doctors, Appointments,
Medical Records, Lab, Pharmacy, Billing, Staff, ...).
Firebase Authentication is used to verify who is calling the API and to
look up each user's role for role-based access control.
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth

from app.core.config import settings

_app = None


def init_firebase():
    global _app
    if _app is None:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        _app = firebase_admin.initialize_app(cred, {
            "projectId": settings.firebase_project_id or None,
        })
    return _app


def get_db():
    """Return a Firestore client. Call init_firebase() first (done at app startup)."""
    return firestore.client()


def get_auth():
    return auth
