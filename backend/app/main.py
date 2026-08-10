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
    admissions,
    medical_records,
    lab,
    pharmacy,
    billing,
    staff,
    reports,
)

# Initialize Firebase Admin SDK once, at startup
init_firebase()

app = FastAPI(title="MediCore Hospital Management System")

# CORS — must be added BEFORE routers are included, and must read
# from settings.cors_origins (set via CORS_ORIGINS env var on Render)
origins = [o.strip() for o in settings.cors_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(doctors.router)
app.include_router(departments.router)
app.include_router(appointments.router)
app.include_router(admissions.router)
app.include_router(medical_records.router)
app.include_router(lab.router)
app.include_router(pharmacy.router)
app.include_router(billing.router)
app.include_router(staff.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "MediCore HMS API"}