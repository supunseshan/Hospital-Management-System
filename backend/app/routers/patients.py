"""Patient Management (spec 3.2): register, update, search, view history."""
from fastapi import APIRouter, Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles

ALL_STAFF = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"]
CAN_WRITE = ["admin", "receptionist", "nurse", "doctor"]

router, service = build_crud_router(
    prefix="/patients",
    tag="patients",
    collection="patients",
    read_roles=ALL_STAFF,
    write_roles=CAN_WRITE,
    delete_roles=["admin"],
)


@router.get("/search/{query}", dependencies=[Depends(require_roles(*ALL_STAFF))])
def search_patients(query: str):
    """Prefix search patients by full_name, used by the Patient Screen search box."""
    return service.search("full_name", query)


router.finalize_item_routes()
