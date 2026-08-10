"""Staff Management (spec 3.9): employee registration, attendance, department
assignment, leave records."""
from fastapi import APIRouter, Depends
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles
from app.services.firestore_service import FirestoreService

router, employee_service = build_crud_router(
    prefix="/staff/employees",
    tag="staff",
    collection="employees",
    read_roles=["admin"],
    write_roles=["admin"],
    delete_roles=["admin"],
)

router.finalize_item_routes()

attendance_router = APIRouter(prefix="/staff/attendance", tags=["staff"])
attendance_service = FirestoreService("attendance")

leave_router = APIRouter(prefix="/staff/leave", tags=["staff"])
leave_service = FirestoreService("leave_requests")


@attendance_router.get("", dependencies=[Depends(require_roles("admin"))])
def list_attendance():
    return attendance_service.list()


@attendance_router.post("", dependencies=[Depends(require_roles("admin"))])
def mark_attendance(payload: dict):
    return attendance_service.create(payload)


@attendance_router.get("/by-employee/{employee_id}", dependencies=[Depends(require_roles("admin"))])
def attendance_by_employee(employee_id: str):
    return attendance_service.list(filters=[("employee_id", "==", employee_id)])


@leave_router.get("", dependencies=[Depends(require_roles("admin"))])
def list_leave_requests():
    return leave_service.list()


@leave_router.post("", dependencies=[Depends(require_roles("admin"))])
def request_leave(payload: dict):
    payload.setdefault("status", "pending")
    return leave_service.create(payload)


@leave_router.patch("/{leave_id}/status", dependencies=[Depends(require_roles("admin"))])
def update_leave_status(leave_id: str, status: str):
    return leave_service.update(leave_id, {"status": status})
