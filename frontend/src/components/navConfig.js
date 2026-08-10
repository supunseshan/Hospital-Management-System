// Central nav map used by the sidebar. Keeping it here (rather than
// scattering role checks through JSX) makes it easy to see, at a glance,
// exactly what the spec's "User Roles / Access Control" (3.1) resolves to.
export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "grid", roles: "*" },
  { to: "/patients", label: "Patients", icon: "user", roles: "*" },
  { to: "/doctors", label: "Doctors", icon: "stethoscope", roles: "*" },
  { to: "/appointments", label: "Appointments", icon: "calendar", roles: "*" },
  { to: "/admissions", label: "Admissions", icon: "bed", roles: ["admin", "doctor", "nurse", "receptionist"] },
  { to: "/medical-records", label: "Medical Records", icon: "file-text", roles: ["admin", "doctor", "nurse"] },
  { to: "/laboratory", label: "Laboratory", icon: "flask", roles: ["admin", "doctor", "nurse", "lab_staff"] },
  { to: "/pharmacy", label: "Pharmacy", icon: "pill", roles: ["admin", "pharmacist", "doctor", "nurse"] },
  { to: "/billing", label: "Billing", icon: "receipt", roles: ["admin", "accountant", "receptionist"] },
  { to: "/staff", label: "Staff", icon: "users", roles: ["admin"] },
  { to: "/departments", label: "Departments", icon: "layers", roles: "*" },
  { to: "/reports", label: "Reports", icon: "bar-chart", roles: "*" },
  { to: "/users", label: "User Accounts", icon: "shield", roles: ["admin"] },
];

export function visibleNavItems(role) {
  return NAV_ITEMS.filter((item) => item.roles === "*" || item.roles.includes(role));
}

export const ROLE_LABELS = {
  admin: "Administrator",
  doctor: "Doctor",
  nurse: "Nurse",
  receptionist: "Receptionist",
  lab_staff: "Laboratory Staff",
  pharmacist: "Pharmacist",
  accountant: "Accountant",
};
