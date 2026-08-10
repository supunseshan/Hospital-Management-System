"""Laboratory Management (spec 3.6): test requests, sample collection, results."""
from fastapi import Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles

READ_ROLES = ["admin", "doctor", "nurse", "lab_staff"]
WRITE_ROLES = ["admin", "doctor", "lab_staff"]

router, service = build_crud_router(
    prefix="/lab-tests",
    tag="laboratory",
    collection="lab_tests",
    read_roles=READ_ROLES,
    write_roles=WRITE_ROLES,
    delete_roles=["admin"],
)


@router.patch("/{test_id}/result", dependencies=[Depends(require_roles("admin", "lab_staff"))])
def enter_result(test_id: str, result: str, result_date: str):
    """Laboratory Staff enters/updates a test result and marks it completed."""
    return service.update(test_id, {"result": result, "result_date": result_date, "status": "completed"})


@router.get("/by-patient/{patient_id}", dependencies=[Depends(require_roles(*READ_ROLES))])
def by_patient(patient_id: str):
    return service.list(filters=[("patient_id", "==", patient_id)])


router.finalize_item_routes()
