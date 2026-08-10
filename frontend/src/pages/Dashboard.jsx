import { useEffect, useState } from "react";
import { Users, CalendarCheck, Wallet, FlaskConical, Pill } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

const CARDS = [
  { key: "total_patients", label: "Total Patients", icon: Users, accent: "bg-teal-700" },
  { key: "todays_appointments", label: "Today's Appointments", icon: CalendarCheck, accent: "bg-teal-600" },
  { key: "revenue_total", label: "Revenue Collected", icon: Wallet, accent: "bg-teal-700", isCurrency: true },
  { key: "pending_lab_requests", label: "Pending Lab Requests", icon: FlaskConical, accent: "bg-clay-400" },
  { key: "pharmacy_alerts", label: "Pharmacy Alerts", icon: Pill, accent: "bg-clay-400" },
];

export default function Dashboard() {
  const { profile, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/reports/dashboard")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <Layout
      title={`Welcome, ${profile?.name || profile?.email}`}
      subtitle="Here's what's happening across the hospital today."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-clay-400/30 bg-clay-50 px-4 py-2 text-sm text-clay-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map(({ key, label, icon: Icon, accent, isCurrency }) => (
          <div key={key} className="card flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white ${accent}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
              <p className="font-mono text-2xl font-bold text-ink">
                {stats ? (isCurrency ? `$${Number(stats[key]).toLocaleString()}` : stats[key]) : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 card p-6">
        <h2 className="mb-1 text-base font-bold text-ink">Signed in as</h2>
        <p className="text-sm text-muted">
          {profile?.email} &middot; role: <span className="font-semibold text-ink">{role}</span>
        </p>
        <p className="mt-3 text-sm text-muted">
          Use the sidebar to manage patients, doctors, appointments, medical records, laboratory,
          pharmacy, billing and staff. Access to each section is controlled by your role.
        </p>
      </div>
    </Layout>
  );
}
