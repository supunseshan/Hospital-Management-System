"""Electronic Medical Records (spec 3.5): diagnosis, prescriptions, treatment history."""
from fastapi import Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles

READ_ROLES = ["admin", "doctor", "nurse"]
WRITE_ROLES = ["admin", "doctor"]

router, service = build_crud_router(
    prefix="/medical-records",
    tag="medical-records",
    collection="medical_records",
    read_roles=READ_ROLES,
    write_roles=WRITE_ROLES,
    delete_roles=["admin"],
)


@router.get("/by-patient/{patient_id}", dependencies=[Depends(require_roles(*READ_ROLES))])
def by_patient(patient_id: str):
    """Full medical history for one patient, used by the patient 'View History' screen."""
    return service.list(filters=[("patient_id", "==", patient_id)])


router.finalize_item_routes()
