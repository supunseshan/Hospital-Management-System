"""Departments, used by Doctor Management (3.3) and Staff Management (3.9)."""
from app.routers.crud_factory import build_crud_router

ALL_STAFF = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"]

router, service = build_crud_router(
    prefix="/departments",
    tag="departments",
    collection="departments",
    read_roles=ALL_STAFF,
    write_roles=["admin"],
    delete_roles=["admin"],
)

router.finalize_item_routes()
