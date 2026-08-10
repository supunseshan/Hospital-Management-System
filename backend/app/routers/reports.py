"""Reports & Analytics (spec 3.10) and the main Dashboard (spec 7)."""
from datetime import date
from fastapi import APIRouter, Depends
from app.core.security import require_roles
from app.services.firestore_service import FirestoreService

router = APIRouter(prefix="/reports", tags=["reports"])

ALL_STAFF = ["admin", "doctor", "nurse", "receptionist", "lab_staff", "pharmacist", "accountant"]

patients_service = FirestoreService("patients")
appointments_service = FirestoreService("appointments")
invoices_service = FirestoreService("billing")
medicines_service = FirestoreService("pharmacy")
lab_service = FirestoreService("lab_tests")
employees_service = FirestoreService("employees")


@router.get("/dashboard", dependencies=[Depends(require_roles(*ALL_STAFF))])
def dashboard():
    """Powers the Dashboard screen: total patients, today's appointments,
    revenue summary, lab requests, pharmacy alerts."""
    today_str = date.today().isoformat()

    patients = patients_service.list()
    appointments = appointments_service.list()
    invoices = invoices_service.list()
    medicines = medicines_service.list()
    lab_tests = lab_service.list()

    today_appointments = [a for a in appointments if a.get("date") == today_str]
    revenue_total = sum(i.get("amount_paid", 0) or 0 for i in invoices)
    pending_lab = [t for t in lab_tests if t.get("status") != "completed"]
    low_stock = [m for m in medicines if m.get("quantity", 0) <= m.get("reorder_level", 10)]

    return {
        "total_patients": len(patients),
        "todays_appointments": len(today_appointments),
        "revenue_total": revenue_total,
        "pending_lab_requests": len(pending_lab),
        "pharmacy_alerts": len(low_stock),
    }


@router.get("/patients", dependencies=[Depends(require_roles("admin", "receptionist"))])
def patient_report():
    patients = patients_service.list()
    return {"total": len(patients), "patients": patients}


@router.get("/appointments", dependencies=[Depends(require_roles("admin", "receptionist", "doctor"))])
def appointment_report():
    appointments = appointments_service.list()
    by_status: dict[str, int] = {}
    for a in appointments:
        by_status[a.get("status", "unknown")] = by_status.get(a.get("status", "unknown"), 0) + 1
    return {"total": len(appointments), "by_status": by_status, "appointments": appointments}


@router.get("/revenue", dependencies=[Depends(require_roles("admin", "accountant"))])
def revenue_report():
    invoices = invoices_service.list()
    total_billed = sum(i.get("total_amount", 0) for i in invoices)
    total_collected = sum(i.get("amount_paid", 0) or 0 for i in invoices)
    return {
        "total_invoices": len(invoices),
        "total_billed": total_billed,
        "total_collected": total_collected,
        "outstanding": total_billed - total_collected,
        "invoices": invoices,
    }


@router.get("/pharmacy", dependencies=[Depends(require_roles("admin", "pharmacist"))])
def pharmacy_report():
    medicines = medicines_service.list()
    return {
        "total_items": len(medicines),
        "low_stock_count": len([m for m in medicines if m.get("quantity", 0) <= m.get("reorder_level", 10)]),
        "medicines": medicines,
    }


@router.get("/laboratory", dependencies=[Depends(require_roles("admin", "lab_staff", "doctor"))])
def laboratory_report():
    tests = lab_service.list()
    by_status: dict[str, int] = {}
    for t in tests:
        by_status[t.get("status", "unknown")] = by_status.get(t.get("status", "unknown"), 0) + 1
    return {"total": len(tests), "by_status": by_status, "tests": tests}


@router.get("/staff", dependencies=[Depends(require_roles("admin"))])
def staff_report():
    employees = employees_service.list()
    by_department: dict[str, int] = {}
    for e in employees:
        dept = e.get("department", "unassigned")
        by_department[dept] = by_department.get(dept, 0) + 1
    return {"total": len(employees), "by_department": by_department, "employees": employees}
