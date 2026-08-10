"""
Authentication & role-based access control.

Every request from the React app carries a Firebase ID token in the
Authorization header: `Authorization: Bearer <token>`. We verify that
token with the Firebase Admin SDK, then load the matching user profile
(with its role) from the `users` collection in Firestore.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.firebase import get_auth, get_db

bearer_scheme = HTTPBearer(auto_error=False)

# Roles allowed in the system (mirrors section 2 "System Overview" of the spec)
ROLES = [
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "lab_staff",
    "pharmacist",
    "accountant",
]


class CurrentUser:
    def __init__(self, uid: str, email: str, role: str, name: str = ""):
        self.uid = uid
        self.email = email
        self.role = role
        self.name = name


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> CurrentUser:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    token = credentials.credentials
    try:
        decoded = get_auth().verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    uid = decoded["uid"]
    email = decoded.get("email", "")

    db = get_db()
    user_doc = db.collection("users").document(uid).get()
    if not user_doc.exists:
        raise HTTPException(
            status_code=403,
            detail="No user profile found. Ask an administrator to create your account.",
        )
    data = user_doc.to_dict()
    return CurrentUser(uid=uid, email=email, role=data.get("role", ""), name=data.get("name", ""))


def require_roles(*allowed_roles: str):
    """
    Dependency factory for role-based access control.
    Usage: Depends(require_roles("admin", "receptionist"))
    """

    async def checker(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{user.role}' is not allowed to perform this action.",
            )
        return user

    return checker
