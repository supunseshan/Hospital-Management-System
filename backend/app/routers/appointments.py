"""Appointment Management (spec 3.4): book, cancel, reschedule, track status."""
from fastapi import Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles

ALL_STAFF = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"]
CAN_WRITE = ["admin", "receptionist", "doctor", "nurse"]

router, service = build_crud_router(
    prefix="/appointments",
    tag="appointments",
    collection="appointments",
    read_roles=ALL_STAFF,
    write_roles=CAN_WRITE,
    delete_roles=["admin", "receptionist"],
)


@router.patch("/{appointment_id}/status", dependencies=[Depends(require_roles(*CAN_WRITE))])
def update_status(appointment_id: str, status: str):
    """Quick status transition: scheduled -> completed / cancelled / rescheduled."""
    return service.update(appointment_id, {"status": status})


@router.get("/by-doctor/{doctor_id}", dependencies=[Depends(require_roles(*ALL_STAFF))])
def by_doctor(doctor_id: str):
    return service.list(filters=[("doctor_id", "==", doctor_id)])


@router.get("/by-patient/{patient_id}", dependencies=[Depends(require_roles(*ALL_STAFF))])
def by_patient(patient_id: str):
    return service.list(filters=[("patient_id", "==", patient_id)])


router.finalize_item_routes()
