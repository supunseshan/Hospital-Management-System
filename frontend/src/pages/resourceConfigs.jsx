// Config-driven definitions for every module built on the generic
// ResourcePage. Keeping table columns + form fields together, per module,
// makes it obvious how each screen maps back to the spec sections.

export const patientsConfig = {
  title: "Patients",
  subtitle: "Register, update, and search patient records (spec 3.2)",
  singular: "Patient",
  endpoint: "/patients",
  searchEndpoint: (q) => `/patients/search/${encodeURIComponent(q)}`,
  columns: [
    { key: "full_name", label: "Name" },
    { key: "gender", label: "Gender" },
    { key: "phone", label: "Phone" },
    { key: "blood_group", label: "Blood Group" },
    { key: "date_of_birth", label: "DOB" },
  ],
  fields: [
    { name: "full_name", label: "Full name", required: true },
    { name: "date_of_birth", label: "Date of birth", type: "date" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email", type: "email" },
    { name: "blood_group", label: "Blood group" },
    { name: "emergency_contact", label: "Emergency contact" },
    { name: "address", label: "Address", fullWidth: true },
    { name: "allergies", label: "Known allergies", fullWidth: true },
    { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
  ],
};

export const doctorsConfig = {
  title: "Doctors",
  subtitle: "Add doctors, assign departments and schedules (spec 3.3)",
  singular: "Doctor",
  endpoint: "/doctors",
  searchEndpoint: (q) => `/doctors/search/${encodeURIComponent(q)}`,
  columns: [
    { key: "full_name", label: "Name" },
    { key: "specialization", label: "Specialization" },
    { key: "department", label: "Department" },
    { key: "phone", label: "Phone" },
    { key: "consultation_fee", label: "Fee" },
  ],
  fields: [
    { name: "full_name", label: "Full name", required: true },
    { name: "specialization", label: "Specialization" },
    { name: "department", label: "Department" },
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email", type: "email" },
    { name: "consultation_fee", label: "Consultation fee", type: "number" },
    { name: "schedule", label: "Schedule (e.g. Mon–Fri 9am–5pm)", fullWidth: true },
  ],
};

export const departmentsConfig = {
  title: "Departments",
  subtitle: "Hospital departments used across doctor and staff assignment",
  singular: "Department",
  endpoint: "/departments",
  columns: [
    { key: "name", label: "Name" },
    { key: "description", label: "Description" },
  ],
  fields: [
    { name: "name", label: "Department name", required: true },
    { name: "description", label: "Description", type: "textarea", fullWidth: true },
  ],
};

const APPOINTMENT_STATUSES = ["scheduled", "completed", "cancelled", "rescheduled"];

export const appointmentsConfig = {
  title: "Appointments",
  subtitle: "Book, cancel, reschedule and track appointments (spec 3.4)",
  singular: "Appointment",
  endpoint: "/appointments",
  columns: [
    { key: "patient_name", label: "Patient" },
    { key: "doctor_name", label: "Doctor" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ],
  fields: [
    { name: "patient_id", label: "Patient ID", required: true },
    { name: "patient_name", label: "Patient name" },
    { name: "doctor_id", label: "Doctor ID", required: true },
    { name: "doctor_name", label: "Doctor name" },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "time", label: "Time (e.g. 10:30)", required: true },
    { name: "status", label: "Status", type: "select", options: APPOINTMENT_STATUSES },
    { name: "reason", label: "Reason for visit", type: "textarea", fullWidth: true },
  ],
  emptyValues: { status: "scheduled" },
};

export const admissionsConfig = {
  title: "Admissions",
  subtitle: "Inpatient ward and bed management",
  singular: "Admission",
  endpoint: "/admissions",
  columns: [
    { key: "patient_id", label: "Patient ID" },
    { key: "ward", label: "Ward" },
    { key: "bed_number", label: "Bed" },
    { key: "admission_date", label: "Admitted" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ],
  fields: [
    { name: "patient_id", label: "Patient ID", required: true },
    { name: "ward", label: "Ward" },
    { name: "bed_number", label: "Bed number" },
    { name: "admitting_doctor_id", label: "Admitting doctor ID" },
    { name: "admission_date", label: "Admission date", type: "date", required: true },
    { name: "discharge_date", label: "Discharge date", type: "date" },
    { name: "status", label: "Status", type: "select", options: ["admitted", "discharged"] },
  ],
  emptyValues: { status: "admitted" },
};

export const medicalRecordsConfig = {
  title: "Medical Records",
  subtitle: "Diagnosis, prescriptions and treatment history (spec 3.5)",
  singular: "Record",
  endpoint: "/medical-records",
  columns: [
    { key: "patient_id", label: "Patient ID" },
    { key: "visit_date", label: "Visit date" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "treatment", label: "Treatment" },
  ],
  fields: [
    { name: "patient_id", label: "Patient ID", required: true },
    { name: "doctor_id", label: "Doctor ID" },
    { name: "visit_date", label: "Visit date", type: "date" },
    { name: "diagnosis", label: "Diagnosis", fullWidth: true },
    { name: "prescription", label: "Prescription", type: "textarea", fullWidth: true },
    { name: "treatment", label: "Treatment", type: "textarea", fullWidth: true },
    { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
  ],
};

// Small shared status pill used by several tables above.
function StatusBadge({ status }) {
  const styles = {
    scheduled: "bg-teal-100 text-teal-700",
    completed: "bg-teal-100 text-teal-700",
    admitted: "bg-teal-100 text-teal-700",
    cancelled: "bg-clay-50 text-clay-600",
    rescheduled: "bg-amber-100 text-amber-700",
    discharged: "bg-canvas text-muted",
  };
  return (
    <span className={`badge ${styles[status] || "bg-canvas text-muted"}`}>{status || "—"}</span>
  );
}
