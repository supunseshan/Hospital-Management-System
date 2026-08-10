import { useEffect, useState, useCallback } from "react";
import { Plus, Check, X as XIcon } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ResourceForm from "../components/ResourceForm";

const EMPLOYEE_FIELDS = [
  { name: "full_name", label: "Full name", required: true },
  { name: "role", label: "Role", required: true },
  { name: "department", label: "Department" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" },
  { name: "joining_date", label: "Joining date", type: "date" },
  { name: "salary", label: "Salary", type: "number" },
];

const ATTENDANCE_FIELDS = [
  { name: "employee_id", label: "Employee ID", required: true },
  { name: "date", label: "Date", type: "date", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["present", "absent", "half_day", "leave"],
  },
];

const LEAVE_FIELDS = [
  { name: "employee_id", label: "Employee ID", required: true },
  { name: "from_date", label: "From", type: "date", required: true },
  { name: "to_date", label: "To", type: "date", required: true },
  { name: "reason", label: "Reason", type: "textarea", fullWidth: true },
];

const TABS = [
  { key: "employees", label: "Employees" },
  { key: "attendance", label: "Attendance" },
  { key: "leave", label: "Leave requests" },
];

export default function Staff() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leave, setLeave] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [empRes, attRes, leaveRes] = await Promise.all([
        client.get("/staff/employees"),
        client.get("/staff/attendance"),
        client.get("/staff/leave"),
      ]);
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setLeave(leaveRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fieldsForTab = () => (tab === "employees" ? EMPLOYEE_FIELDS : tab === "attendance" ? ATTENDANCE_FIELDS : LEAVE_FIELDS);
  const endpointForTab = () => (tab === "employees" ? "/staff/employees" : tab === "attendance" ? "/staff/attendance" : "/staff/leave");

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      if (tab === "employees" && editing) {
        await client.put(`/staff/employees/${editing.id}`, values);
      } else {
        await client.post(endpointForTab(), values);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveStatus = async (leaveReq, status) => {
    try {
      await client.patch(`/staff/leave/${leaveReq.id}/status?status=${status}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout title="Staff Management" subtitle="Employee registration, attendance and leave (spec 3.9)">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                tab === t.key ? "bg-teal-700 text-white" : "text-muted hover:bg-canvas"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== "leave" && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add {tab === "employees" ? "employee" : "record"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-clay-400/30 bg-clay-50 px-4 py-2 text-sm text-clay-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-muted">Loading&hellip;</p>
      ) : tab === "employees" ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3 font-medium">{e.full_name}</td>
                  <td className="px-4 py-3">{e.role}</td>
                  <td className="px-4 py-3">{e.department || "—"}</td>
                  <td className="px-4 py-3">{e.phone || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-secondary !px-2 !py-1.5"
                      onClick={() => {
                        setEditing(e);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === "attendance" ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3">{a.employee_id}</td>
                  <td className="px-4 py-3">{a.date}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-teal-100 text-teal-700">{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Employee ID</th>
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">To</th>
                <th className="px-4 py-3 font-semibold">Reason</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leave.map((l) => (
                <tr key={l.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3">{l.employee_id}</td>
                  <td className="px-4 py-3">{l.from_date}</td>
                  <td className="px-4 py-3">{l.to_date}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{l.reason || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        l.status === "approved"
                          ? "bg-teal-700 text-white"
                          : l.status === "rejected"
                          ? "bg-clay-50 text-clay-600"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {l.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <button className="btn-secondary !px-2 !py-1.5" onClick={() => handleLeaveStatus(l, "approved")}>
                          <Check size={14} />
                        </button>
                        <button className="btn-danger !px-2 !py-1.5" onClick={() => handleLeaveStatus(l, "rejected")}>
                          <XIcon size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit employee" : `Add ${tab === "employees" ? "employee" : "record"}`}>
        <ResourceForm
          fields={fieldsForTab()}
          initialValues={editing || {}}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </Layout>
  );
}
