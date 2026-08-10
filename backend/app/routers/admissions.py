"""Inpatient and Outpatient Management: ward/bed admissions and discharge."""
from fastapi import Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles

READ_ROLES = ["admin", "doctor", "nurse", "receptionist"]
WRITE_ROLES = ["admin", "doctor", "nurse", "receptionist"]

router, service = build_crud_router(
    prefix="/admissions",
    tag="admissions",
    collection="admissions",
    read_roles=READ_ROLES,
    write_roles=WRITE_ROLES,
    delete_roles=["admin"],
)


@router.patch("/{admission_id}/discharge", dependencies=[Depends(require_roles(*WRITE_ROLES))])
def discharge(admission_id: str, discharge_date: str):
    return service.update(admission_id, {"status": "discharged", "discharge_date": discharge_date})


router.finalize_item_routes()
