import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, PackageCheck, AlertTriangle } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ResourceForm from "../components/ResourceForm";

const MEDICINE_FIELDS = [
  { name: "name", label: "Medicine name", required: true },
  { name: "category", label: "Category" },
  { name: "quantity", label: "Quantity in stock", type: "number", required: true },
  { name: "unit_price", label: "Unit price", type: "number" },
  { name: "reorder_level", label: "Reorder level", type: "number" },
  { name: "expiry_date", label: "Expiry date", type: "date" },
  { name: "supplier", label: "Supplier" },
];

const TABS = [
  { key: "inventory", label: "Inventory" },
  { key: "alerts", label: "Alerts" },
  { key: "prescriptions", label: "Prescriptions" },
];

export default function Pharmacy() {
  const [tab, setTab] = useState("inventory");
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiring, setExpiring] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [medsRes, lowRes, expRes, presRes] = await Promise.all([
        client.get("/pharmacy/medicines"),
        client.get("/pharmacy/medicines/low-stock"),
        client.get("/pharmacy/medicines/expiring-soon"),
        client.get("/pharmacy/prescriptions"),
      ]);
      setMedicines(medsRes.data);
      setLowStock(lowRes.data);
      setExpiring(expRes.data);
      setPrescriptions(presRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (med) => {
    setEditing(med);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        await client.put(`/pharmacy/medicines/${editing.id}`, values);
      } else {
        await client.post("/pharmacy/medicines", values);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (med) => {
    if (!confirm(`Remove ${med.name} from inventory?`)) return;
    try {
      await client.delete(`/pharmacy/medicines/${med.id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDispense = async (presc) => {
    try {
      await client.post(`/pharmacy/prescriptions/${presc.id}/dispense`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout title="Pharmacy" subtitle="Medicine inventory, stock and prescription processing (spec 3.7)">
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
        {tab === "inventory" && (
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Add medicine
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
      ) : tab === "inventory" ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Unit price</th>
                <th className="px-4 py-3 font-semibold">Expiry</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3 font-medium">{m.name}</td>
                  <td className="px-4 py-3">{m.category || "—"}</td>
                  <td className="px-4 py-3 font-mono">
                    {m.quantity}
                    {m.quantity <= (m.reorder_level ?? 10) && (
                      <AlertTriangle size={13} className="ml-1 inline text-clay-400" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono">${m.unit_price}</td>
                  <td className="px-4 py-3">{m.expiry_date || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary !px-2 !py-1.5" onClick={() => openEdit(m)}>
                        <Pencil size={14} />
                      </button>
                      <button className="btn-danger !px-2 !py-1.5" onClick={() => handleDelete(m)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === "alerts" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-3 font-bold text-ink">Low stock</h3>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted">Nothing below reorder level.</p>
            ) : (
              <ul className="space-y-2">
                {lowStock.map((m) => (
                  <li key={m.id} className="flex justify-between text-sm">
                    <span>{m.name}</span>
                    <span className="font-mono text-clay-600">{m.quantity} left</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card p-5">
            <h3 className="mb-3 font-bold text-ink">Expiring soon (30 days)</h3>
            {expiring.length === 0 ? (
              <p className="text-sm text-muted">Nothing expiring soon.</p>
            ) : (
              <ul className="space-y-2">
                {expiring.map((m) => (
                  <li key={m.id} className="flex justify-between text-sm">
                    <span>{m.name}</span>
                    <span className="font-mono text-clay-600">{m.expiry_date}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Patient ID</th>
                <th className="px-4 py-3 font-semibold">Items</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No prescriptions yet. Doctors create these from a patient's medical record.
                  </td>
                </tr>
              ) : (
                prescriptions.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                    <td className="px-4 py-3">{p.patient_id}</td>
                    <td className="px-4 py-3">{(p.items || []).map((i) => i.name).join(", ") || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          p.status === "dispensed" ? "bg-teal-700 text-white" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="btn-secondary !px-2 !py-1.5"
                        onClick={() => handleDispense(p)}
                        disabled={p.status === "dispensed"}
                        title="Dispense"
                      >
                        <PackageCheck size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit medicine" : "Add medicine"}>
        <ResourceForm
          fields={MEDICINE_FIELDS}
          initialValues={editing || { quantity: 0, unit_price: 0, reorder_level: 10 }}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </Layout>
  );
}
