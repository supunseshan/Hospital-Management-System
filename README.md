# MediCore — Hospital Management System (HMS)

A full-stack Hospital Management System built from the attached spec:
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Python (FastAPI)
- **Storage & Auth:** Firebase (Firestore + Firebase Authentication)

Covers every functional module from the spec (section 3) except "Future
Enhancements" (section 12), as requested: User Management, Patients,
Doctors, Appointments, Electronic Medical Records, Laboratory, Pharmacy,
Billing, Staff Management, Admissions, and Reports/Dashboard.

```
hospital-management-system/
├── backend/     FastAPI app (Firestore + Firebase Auth)
└── frontend/    React app (Vite + Tailwind)
```

---

## 1. Create the Firebase project (one-time)

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `hms-yourhospital`).
2. **Enable Firestore**: Build → Firestore Database → Create database → Start in **production mode** (rules below lock it down anyway).
3. **Enable Authentication**: Build → Authentication → Get started → enable the **Email/Password** sign-in provider.
4. **Get a Web app config** (for the React frontend): Project settings (gear icon) → General → "Your apps" → Add app → Web (`</>`). Copy the `firebaseConfig` values — you'll paste them into `frontend/.env`.
5. **Get a Service Account key** (for the Python backend): Project settings → Service accounts → Generate new private key. This downloads a JSON file — save it as `backend/firebase-service-account.json`.

### Firestore security rules

Since all reads/writes go through the FastAPI backend (which verifies the
Firebase ID token and checks roles before touching Firestore), lock direct
client access down. In Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // backend uses the Admin SDK, which bypasses rules
    }
  }
}
```

---

## 2. Run the backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

cp .env.example .env
# edit .env:
#   FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
#   FIREBASE_PROJECT_ID=<your-project-id>
#   CORS_ORIGINS=http://localhost:5173

# place the service account key you downloaded above at:
#   backend/firebase-service-account.json

uvicorn app.main:app --reload --port 8000
```

API docs (interactive): http://localhost:8000/docs

### Create the first admin account

Every staff account after this one is created from inside the app (an
admin-only "Add staff account" screen). But the very first admin has to
be created directly, since there's no admin yet to create one:

```bash
cd backend
source venv/bin/activate
python scripts/create_admin.py --name "Hospital Admin" --email admin@example.com --password "ChangeMe123!"
```

---

## 3. Run the frontend (React)

```bash
cd frontend
npm install

cp .env.example .env
# edit .env and paste your Firebase web app config (step 1.4 above),
# plus VITE_API_BASE_URL=http://localhost:8000

npm run dev
```

Open http://localhost:5173, sign in with the admin account you just
created, then use **User Accounts** (sidebar, admin-only) to create
accounts for doctors, nurses, receptionists, lab staff, pharmacists and
accountants — each gets its own role and only sees the sections that
role is meant to access.

---

## Roles and access (spec 3.1)

| Role | Can access |
|---|---|
| **admin** | Everything, including Staff Management and User Accounts |
| **doctor** | Patients, Doctors, Appointments, Admissions, Medical Records, Laboratory, Pharmacy (read), Reports |
| **nurse** | Patients, Doctors, Appointments, Admissions, Medical Records (read), Laboratory (read), Pharmacy (read) |
| **receptionist** | Patients, Doctors, Appointments, Admissions, Billing, Reports |
| **lab_staff** | Laboratory, Patients/Doctors (read), Reports |
| **pharmacist** | Pharmacy, Reports |
| **accountant** | Billing, Reports |

Every backend endpoint enforces this server-side (`app/core/security.py`)
— the frontend sidebar just reflects it so people don't see options they
can't use.

---

## Project structure

```
backend/
  app/
    core/            config, Firebase init, auth/RBAC
    models/          Pydantic schemas for every module
    routers/         one file per module (patients, doctors, appointments,
                      medical_records, lab, pharmacy, billing, staff,
                      admissions, reports, auth) built on a shared CRUD
                      factory (routers/crud_factory.py)
    services/         generic Firestore CRUD helper
    main.py           FastAPI app, wires all routers together
  scripts/
    create_admin.py   bootstraps the first admin account
  requirements.txt
  .env.example

frontend/
  src/
    api/client.js      axios instance, attaches Firebase ID token
    context/AuthContext.jsx
    components/        Layout (sidebar/topbar), Modal, ResourceForm, ProtectedRoute
    pages/
      ResourcePage.jsx + resourceConfigs.jsx   generic CRUD screens
                                                (Patients, Doctors, Departments,
                                                Appointments, Admissions, Medical Records)
      Laboratory.jsx, Pharmacy.jsx, Billing.jsx, Staff.jsx   custom screens
                                                              with module-specific actions
      Dashboard.jsx, Reports.jsx, Login.jsx, Users.jsx
    App.jsx             routes + role guards
  package.json
  .env.example
```

## Extending it

- **Add a field to a module** (e.g. a new patient field): add it to the
  Pydantic model in `backend/app/models/schemas.py` (optional, for docs/
  validation) and to the `fields`/`columns` array in
  `frontend/src/pages/resourceConfigs.jsx`. No new endpoints needed — the
  Firestore documents are schemaless.
- **Add a whole new module**: copy the pattern in
  `backend/app/routers/departments.py` (simplest example) for the API,
  and add a config block to `resourceConfigs.jsx` + a route in `App.jsx`
  for the UI.
