import { useEffect, useState } from "react";
import client from "../api/client";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

// Each report is fetched from its own backend endpoint, guarded by role on
// the server; we just render what comes back for whichever ones the
// current role is allowed to see.
const REPORTS = [
  { key: "patients", label: "Patient report", endpoint: "/reports/patients", roles: ["admin", "receptionist"] },
  { key: "appointments", label: "Appointment report", endpoint: "/reports/appointments", roles: ["admin", "receptionist", "doctor"] },
  { key: "revenue", label: "Revenue report", endpoint: "/reports/revenue", roles: ["admin", "accountant"] },
  { key: "pharmacy", label: "Pharmacy report", endpoint: "/reports/pharmacy", roles: ["admin", "pharmacist"] },
  { key: "laboratory", label: "Laboratory report", endpoint: "/reports/laboratory", roles: ["admin", "lab_staff", "doctor"] },
  { key: "staff", label: "Staff report", endpoint: "/reports/staff", roles: ["admin"] },
];

export default function Reports() {
  const { role } = useAuth();
  const available = REPORTS.filter((r) => r.roles.includes(role));
  const [active, setActive] = useState(available[0]?.key);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const report = REPORTS.find((r) => r.key === active);
    if (!report) return;
    setData(null);
    setError("");
    client
      .get(report.endpoint)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, [active]);

  return (
    <Layout title="Reports" subtitle="Reports & analytics across the hospital (spec 3.10)">
      <div className="mb-4 flex flex-wrap gap-2">
        {available.map((r) => (
          <button
            key={r.key}
            onClick={() => setActive(r.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active === r.key ? "bg-teal-700 text-white" : "border border-border bg-surface text-muted hover:bg-canvas"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-clay-400/30 bg-clay-50 px-4 py-2 text-sm text-clay-600">
          {error}
        </div>
      )}

      {!data ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(data)
              .filter(([k, v]) => typeof v === "number" || (typeof v === "string" && k !== "id"))
              .map(([k, v]) => (
                <div key={k} className="card p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {k.replace(/_/g, " ")}
                  </p>
                  <p className="font-mono text-xl font-bold text-ink">
                    {typeof v === "number" ? v.toLocaleString() : v}
                  </p>
                </div>
              ))}
          </div>

          {Object.entries(data)
            .filter(([, v]) => Array.isArray(v))
            .map(([k, rows]) => (
              <div key={k} className="card overflow-x-auto">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="font-bold capitalize text-ink">{k.replace(/_/g, " ")}</h3>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
                      {rows[0] &&
                        Object.keys(rows[0])
                          .filter((c) => !["id", "created_at", "updated_at"].includes(c))
                          .slice(0, 6)
                          .map((c) => (
                            <th key={c} className="px-4 py-2 font-semibold">
                              {c.replace(/_/g, " ")}
                            </th>
                          ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 25).map((row, i) => (
                      <tr key={row.id || i} className="border-b border-border last:border-0">
                        {Object.entries(row)
                          .filter(([c]) => !["id", "created_at", "updated_at"].includes(c))
                          .slice(0, 6)
                          .map(([c, v]) => (
                            <td key={c} className="px-4 py-2">
                              {typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      )}
    </Layout>
  );
}
