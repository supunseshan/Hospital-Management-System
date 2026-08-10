"""Billing System (spec 3.8): consultation/lab/pharmacy/admission charges,
invoice generation, payment recording."""
from fastapi import APIRouter, Depends, HTTPException
from app.routers.crud_factory import build_crud_router
from app.core.security import require_roles
from app.services.firestore_service import FirestoreService

READ_ROLES = ["admin", "accountant", "receptionist"]
WRITE_ROLES = ["admin", "accountant", "receptionist"]

router, invoice_service = build_crud_router(
    prefix="/billing/invoices",
    tag="billing",
    collection="billing",
    read_roles=READ_ROLES,
    write_roles=WRITE_ROLES,
    delete_roles=["admin"],
)

payments_router = APIRouter(prefix="/billing/payments", tags=["billing"])
payment_service = FirestoreService("payments")


@router.get("/by-patient/{patient_id}", dependencies=[Depends(require_roles(*READ_ROLES))])
def invoices_by_patient(patient_id: str):
    return invoice_service.list(filters=[("patient_id", "==", patient_id)])


router.finalize_item_routes()


@payments_router.get("", dependencies=[Depends(require_roles(*READ_ROLES))])
def list_payments():
    return payment_service.list()


@payments_router.post("", dependencies=[Depends(require_roles(*WRITE_ROLES))])
def record_payment(payload: dict):
    """Receive Payment (Billing Screen): records payment and updates invoice status."""
    invoice_id = payload.get("invoice_id")
    invoice = invoice_service.get(invoice_id) if invoice_id else None
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    payment = payment_service.create(payload)

    paid_so_far = sum(
        p.get("amount", 0) for p in payment_service.list(filters=[("invoice_id", "==", invoice_id)])
    )
    total = invoice.get("total_amount", 0)
    new_status = "paid" if paid_so_far >= total else "partially_paid" if paid_so_far > 0 else "unpaid"
    invoice_service.update(invoice_id, {"status": new_status, "amount_paid": paid_so_far})

    return payment
