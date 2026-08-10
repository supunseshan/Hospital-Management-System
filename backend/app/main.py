"""
Hospital Management System - Backend API

Framework: FastAPI (Python)
Database / Auth: Firebase (Firestore + Firebase Authentication)

Run locally:
    uvicorn app.main:app --reload --port 8000

Interactive API docs: http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.firebase import init_firebase

from app.routers import (
    auth,
    patients,
    doctors,
    departments,
    appointments,
    medical_records,
    lab,
    pharmacy,
    billing,
    staff,
    admissions,
    reports,
)

init_firebase()

app = FastAPI(
    title="Hospital Management System API",
    description="Backend for the HMS: patients, doctors, appointments, EMR, "
    "laboratory, pharmacy, billing, staff and reports.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(departments.router)
app.include_router(appointments.router)
app.include_router(medical_records.router)
app.include_router(lab.router)
app.include_router(pharmacy.router)
app.include_router(pharmacy.prescriptions_router)
app.include_router(billing.router)
app.include_router(billing.payments_router)
app.include_router(staff.router)
app.include_router(staff.attendance_router)
app.include_router(staff.leave_router)
app.include_router(admissions.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Hospital Management System API"}


@app.get("/health")
def health():
    return {"status": "healthy"}
