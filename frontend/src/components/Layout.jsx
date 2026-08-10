import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  admin: [
    { to: "/", label: "Dashboard" }, { to: "/patients", label: "Patients" },
    { to: "/doctors", label: "Doctors" }, { to: "/departments", label: "Departments" },
    { to: "/appointments", label: "Appointments" }, { to: "/admissions", label: "Admissions" },
    { to: "/medical-records", label: "Medical Records" }, { to: "/laboratory", label: "Laboratory" },
    { to: "/pharmacy", label: "Pharmacy" }, { to: "/billing", label: "Billing" },
    { to: "/staff", label: "Staff Management" }, { to: "/reports", label: "Reports" },
    { to: "/users", label: "User Accounts" },
  ],
  doctor: [
    { to: "/", label: "Dashboard" }, { to: "/patients", label: "Patients" },
    { to: "/doctors", label: "Doctors" }, { to: "/appointments", label: "Appointments" },
    { to: "/admissions", label: "Admissions" }, { to: "/medical-records", label: "Medical Records" },
    { to: "/laboratory", label: "Laboratory" }, { to: "/pharmacy", label: "Pharmacy" },
    { to: "/reports", label: "Reports" },
  ],
  nurse: [
    { to: "/", label: "Dashboard" }, { to: "/patients", label: "Patients" },
    { to: "/doctors", label: "Doctors" }, { to: "/appointments", label: "Appointments" },
    { to: "/admissions", label: "Admissions" }, { to: "/medical-records", label: "Medical Records" },
    { to: "/laboratory", label: "Laboratory" }, { to: "/pharmacy", label: "Pharmacy" },
  ],
  receptionist: [
    { to: "/", label: "Dashboard" }, { to: "/patients", label: "Patients" },
    { to: "/doctors", label: "Doctors" }, { to: "/departments", label: "Departments" },
    { to: "/appointments", label: "Appointments" }, { to: "/admissions", label: "Admissions" },
    { to: "/billing", label: "Billing" }, { to: "/reports", label: "Reports" },
  ],
  lab_staff: [
    { to: "/", label: "Dashboard" }, { to: "/laboratory", label: "Laboratory" },
    { to: "/patients", label: "Patients" }, { to: "/doctors", label: "Doctors" },
    { to: "/reports", label: "Reports" },
  ],
  pharmacist: [
    { to: "/", label: "Dashboard" }, { to: "/pharmacy", label: "Pharmacy" },
    { to: "/reports", label: "Reports" },
  ],
  accountant: [
    { to: "/", label: "Dashboard" }, { to: "/billing", label: "Billing" },
    { to: "/reports", label: "Reports" },
  ],
};

export default function Layout({ children }) {
  const { role, profile, logout } = useAuth();
  const links = NAV_BY_ROLE[role] || [];

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-slate-900 text-slate-200 p-4 flex flex-col">
        <div className="mb-4">
          <p className="font-semibold text-white">{profile?.name}</p>
          <p className="text-xs uppercase text-slate-400">{role}</p>
        </div>
        <nav className="space-y-1 flex-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block px-3 py-2 rounded hover:bg-slate-800 text-sm">
              {l.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="text-red-400 text-sm text-left mt-4">
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 bg-slate-50 overflow-y-auto">{children}</main>
    </div>
  );
}