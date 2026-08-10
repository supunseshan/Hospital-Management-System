"""Pharmacy Management (spec 3.7): medicine inventory, prescription processing,
stock management, expiry monitoring."""
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles
from app.services.firestore_service import FirestoreService

READ_ROLES = ["admin", "pharmacist", "doctor", "nurse"]
WRITE_ROLES = ["admin", "pharmacist"]

# Medicine inventory CRUD
router, medicine_service = build_crud_router(
    prefix="/pharmacy/medicines",
    tag="pharmacy",
    collection="pharmacy",
    read_roles=READ_ROLES,
    write_roles=WRITE_ROLES,
    delete_roles=["admin"],
)

prescriptions_router = APIRouter(prefix="/pharmacy/prescriptions", tags=["pharmacy"])
prescription_service = FirestoreService("prescriptions")


@router.get("/low-stock", dependencies=[Depends(require_roles(*READ_ROLES))])
def low_stock():
    """Medicines at/below their reorder level (Pharmacy Alerts on the dashboard)."""
    all_meds = medicine_service.list()
    return [m for m in all_meds if m.get("quantity", 0) <= m.get("reorder_level", 10)]


@router.get("/expiring-soon", dependencies=[Depends(require_roles(*READ_ROLES))])
def expiring_soon(days: int = 30):
    """Medicines expiring within `days` days (expiry monitoring)."""
    today = date.today()
    result = []
    for m in medicine_service.list():
        exp = m.get("expiry_date")
        if not exp:
            continue
        try:
            exp_date = datetime.fromisoformat(exp).date()
        except ValueError:
            continue
        if (exp_date - today).days <= days:
            result.append(m)
    return result


router.finalize_item_routes()


@prescriptions_router.get("", dependencies=[Depends(require_roles(*READ_ROLES))])
def list_prescriptions():
    return prescription_service.list()


@prescriptions_router.post("", dependencies=[Depends(require_roles("admin", "doctor"))])
def create_prescription(payload: dict):
    """A doctor creates a prescription (from a medical record) for pharmacy to fulfil."""
    payload.setdefault("status", "pending")
    return prescription_service.create(payload)


@prescriptions_router.post("/{prescription_id}/dispense", dependencies=[Depends(require_roles(*WRITE_ROLES))])
def dispense(prescription_id: str):
    """Pharmacist dispenses a prescription: deducts stock and marks it dispensed."""
    presc = prescription_service.get(prescription_id)
    if not presc:
        raise HTTPException(status_code=404, detail="Prescription not found")
    if presc.get("status") == "dispensed":
        raise HTTPException(status_code=400, detail="Already dispensed")

    for item in presc.get("items", []):
        med = medicine_service.get(item["medicine_id"])
        if not med:
            continue
        new_qty = max(0, med.get("quantity", 0) - item.get("quantity", 0))
        medicine_service.update(item["medicine_id"], {"quantity": new_qty})

    return prescription_service.update(prescription_id, {"status": "dispensed"})
