"""Doctor Management (spec 3.3): add doctor, department assignment, schedule."""
from fastapi import Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles

ALL_STAFF = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"]

router, service = build_crud_router(
    prefix="/doctors",
    tag="doctors",
    collection="doctors",
    read_roles=ALL_STAFF,
    write_roles=["admin"],
    delete_roles=["admin"],
)


@router.get("/search/{query}", dependencies=[Depends(require_roles(*ALL_STAFF))])
def search_doctors(query: str):
    return service.search("full_name", query)


router.finalize_item_routes()
