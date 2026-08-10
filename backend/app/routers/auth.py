"""
Auth & user profile endpoints.

Sign-in itself happens on the React client using the Firebase Auth SDK
(email/password). This router only:
  1. Lets an admin create new staff accounts (Firebase Auth user + Firestore
     profile with a role) - see spec 3.1 "User Roles".
  2. Returns the profile (with role) for whoever's ID token was sent, so the
     frontend knows what to show/hide.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.core.firebase import get_auth
from app.core.security import get_current_user, require_roles, CurrentUser, ROLES
from app.models.schemas import UserProfileIn
from app.services.firestore_service import FirestoreService

router = APIRouter(prefix="/auth", tags=["auth"])
users_service = FirestoreService("users")


@router.get("/me")
def me(user: CurrentUser = Depends(get_current_user)):
    profile = users_service.get(user.uid)
    return {
        "uid": user.uid,
        "email": user.email,
        "role": user.role,
        "name": user.name,
        "profile": profile,
    }


@router.get("/roles")
def list_roles():
    return {"roles": ROLES}


@router.post("/register-staff", dependencies=[Depends(require_roles("admin"))])
def register_staff(payload: UserProfileIn, temp_password: str):
    """
    Admin-only: creates a Firebase Auth account for a new staff member
    (doctor / nurse / receptionist / lab_staff / pharmacist / accountant)
    plus their Firestore profile document (used for role-based access).
    """
    if payload.role not in ROLES:
        raise HTTPException(status_code=400, detail=f"role must be one of {ROLES}")

    try:
        fb_user = get_auth().create_user(
            email=payload.email,
            password=temp_password,
            display_name=payload.name,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not create Firebase user: {exc}")

    profile = users_service.create(payload.model_dump(), doc_id=fb_user.uid)
    return profile


@router.get("/users", dependencies=[Depends(require_roles("admin"))])
def list_users():
    return users_service.list()


@router.delete("/users/{uid}", dependencies=[Depends(require_roles("admin"))])
def deactivate_user(uid: str):
    try:
        get_auth().update_user(uid, disabled=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    users_service.update(uid, {"disabled": True})
    return {"disabled": True}
