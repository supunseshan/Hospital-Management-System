"""
Pydantic request/response models for every module in the spec:
Patients, Doctors, Appointments, Medical Records, Laboratory, Pharmacy,
Billing, Staff, and Users.

All models use `Optional` server-generated fields (id, created_at,
updated_at) that the client never sends.
"""
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class BaseOut(BaseModel):
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ---------- Users (section 3.1 User Management) ----------
class UserProfileIn(BaseModel):
    name: str
    email: EmailStr
    role: str  # admin | doctor | nurse | receptionist | lab_staff | pharmacist | accountant
    phone: Optional[str] = None
    department: Optional[str] = None


class UserProfileOut(UserProfileIn, BaseOut):
    pass


# ---------- Patients (3.2) ----------
class PatientIn(BaseModel):
    full_name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    allergies: Optional[str] = None
    notes: Optional[str] = None


class PatientOut(PatientIn, BaseOut):
    pass


# ---------- Doctors (3.3) ----------
class DoctorIn(BaseModel):
    full_name: str
    specialization: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    schedule: Optional[str] = None  # free text e.g. "Mon-Fri 9am-5pm"
    consultation_fee: Optional[float] = None


class DoctorOut(DoctorIn, BaseOut):
    pass


# ---------- Departments ----------
class DepartmentIn(BaseModel):
    name: str
    description: Optional[str] = None


class DepartmentOut(DepartmentIn, BaseOut):
    pass


# ---------- Appointments (3.4) ----------
class AppointmentIn(BaseModel):
    patient_id: str
    patient_name: Optional[str] = None
    doctor_id: str
    doctor_name: Optional[str] = None
    date: str  # ISO date
    time: str  # e.g. "10:30"
    reason: Optional[str] = None
    status: str = "scheduled"  # scheduled | completed | cancelled | rescheduled


class AppointmentOut(AppointmentIn, BaseOut):
    pass


# ---------- Electronic Medical Records (3.5) ----------
class MedicalRecordIn(BaseModel):
    patient_id: str
    doctor_id: Optional[str] = None
    visit_date: Optional[str] = None
    diagnosis: Optional[str] = None
    prescription: Optional[str] = None
    treatment: Optional[str] = None
    notes: Optional[str] = None


class MedicalRecordOut(MedicalRecordIn, BaseOut):
    pass


# ---------- Laboratory (3.6) ----------
class LabTestIn(BaseModel):
    patient_id: str
    doctor_id: Optional[str] = None
    test_name: str
    sample_type: Optional[str] = None
    status: str = "requested"  # requested | sample_collected | in_progress | completed
    result: Optional[str] = None
    result_date: Optional[str] = None


class LabTestOut(LabTestIn, BaseOut):
    pass


# ---------- Pharmacy (3.7) ----------
class MedicineIn(BaseModel):
    name: str
    category: Optional[str] = None
    quantity: int = 0
    unit_price: float = 0
    expiry_date: Optional[str] = None
    supplier: Optional[str] = None
    reorder_level: int = 10


class MedicineOut(MedicineIn, BaseOut):
    pass


class PrescriptionDispenseIn(BaseModel):
    patient_id: str
    medical_record_id: Optional[str] = None
    items: list[dict] = Field(default_factory=list)  # [{medicine_id, name, quantity, unit_price}]
    status: str = "pending"  # pending | dispensed


class PrescriptionDispenseOut(PrescriptionDispenseIn, BaseOut):
    pass


# ---------- Billing (3.8) ----------
class InvoiceIn(BaseModel):
    patient_id: str
    patient_name: Optional[str] = None
    items: list[dict] = Field(default_factory=list)  # [{description, category, amount}]
    total_amount: float = 0
    status: str = "unpaid"  # unpaid | paid | partially_paid


class InvoiceOut(InvoiceIn, BaseOut):
    pass


class PaymentIn(BaseModel):
    invoice_id: str
    amount: float
    method: str = "cash"  # cash | card | insurance | bank_transfer
    reference: Optional[str] = None


class PaymentOut(PaymentIn, BaseOut):
    pass


# ---------- Staff Management (3.9) ----------
class EmployeeIn(BaseModel):
    full_name: str
    role: str
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    joining_date: Optional[str] = None
    salary: Optional[float] = None


class EmployeeOut(EmployeeIn, BaseOut):
    pass


class AttendanceIn(BaseModel):
    employee_id: str
    date: str
    status: str = "present"  # present | absent | half_day | leave


class AttendanceOut(AttendanceIn, BaseOut):
    pass


class LeaveRequestIn(BaseModel):
    employee_id: str
    from_date: str
    to_date: str
    reason: Optional[str] = None
    status: str = "pending"  # pending | approved | rejected


class LeaveRequestOut(LeaveRequestIn, BaseOut):
    pass


# ---------- Admissions (Inpatient) ----------
class AdmissionIn(BaseModel):
    patient_id: str
    ward: Optional[str] = None
    bed_number: Optional[str] = None
    admitting_doctor_id: Optional[str] = None
    admission_date: str
    discharge_date: Optional[str] = None
    status: str = "admitted"  # admitted | discharged


class AdmissionOut(AdmissionIn, BaseOut):
    pass
