import { useEffect, useState } from "react";
import { Plus, Ban } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ResourceForm from "../components/ResourceForm";
import { ROLE_LABELS } from "../components/navConfig";

const FIELDS = [
  { name: "name", label: "Full name", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "role",
    label: "Role",
    type: "select",
    required: true,
    options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
  },
  { name: "phone", label: "Phone" },
  { name: "department", label: "Department" },
  { name: "temp_password", label: "Temporary password", type: "password", required: true, fullWidth: true },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    client
      .get("/auth/users")
      .then((res) => setUsers(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      const { temp_password, ...profile } = values;
      await client.post(`/auth/register-staff?temp_password=${encodeURIComponent(temp_password)}`, profile);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (!confirm(`Deactivate ${u.name}'s account?`)) return;
    try {
      await client.delete(`/auth/users/${u.id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout title="User Accounts" subtitle="Create and manage staff logins (spec 3.1 User Management)">
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add staff account
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-clay-400/30 bg-clay-50 px-4 py-2 text-sm text-clay-600">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Department</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Loading&hellip;</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-teal-100 text-teal-700">{ROLE_LABELS[u.role] || u.role}</span>
                  </td>
                  <td className="px-4 py-3">{u.department || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="btn-danger !px-2 !py-1.5" onClick={() => handleDeactivate(u)} title="Deactivate">
                      <Ban size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add staff account">
        <ResourceForm
          fields={FIELDS}
          initialValues={{}}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </Layout>
  );
}
