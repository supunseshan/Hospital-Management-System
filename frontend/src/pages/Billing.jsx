import { useEffect, useState, useCallback } from "react";
import { Plus, DollarSign } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ResourceForm from "../components/ResourceForm";

const INVOICE_FIELDS = [
  { name: "patient_id", label: "Patient ID", required: true },
  { name: "patient_name", label: "Patient name" },
  { name: "total_amount", label: "Total amount", type: "number", required: true },
];

const PAYMENT_FIELDS = [
  { name: "amount", label: "Amount", type: "number", required: true },
  {
    name: "method",
    label: "Payment method",
    type: "select",
    options: ["cash", "card", "insurance", "bank_transfer"],
  },
  { name: "reference", label: "Reference / transaction #" },
];

const STATUS_STYLES = {
  paid: "bg-teal-700 text-white",
  partially_paid: "bg-amber-100 text-amber-700",
  unpaid: "bg-clay-50 text-clay-600",
};

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get("/billing/invoices");
      setInvoices(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateInvoice = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await client.post("/billing/invoices", { ...values, status: "unpaid", items: [] });
      setInvoiceModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await client.post("/billing/payments", { ...values, invoice_id: paymentTarget.id });
      setPaymentTarget(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Billing" subtitle="Invoice generation and payment recording (spec 3.8)">
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => setInvoiceModalOpen(true)}>
          <Plus size={16} /> Generate invoice
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
              <th className="px-4 py-3 font-semibold">Patient</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Paid</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Loading&hellip;</td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">No invoices yet.</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3">{inv.patient_name || inv.patient_id}</td>
                  <td className="px-4 py-3 font-mono">${inv.total_amount}</td>
                  <td className="px-4 py-3 font-mono">${inv.amount_paid || 0}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[inv.status] || "bg-canvas text-muted"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-secondary !px-2 !py-1.5"
                      onClick={() => setPaymentTarget(inv)}
                      disabled={inv.status === "paid"}
                      title="Receive payment"
                    >
                      <DollarSign size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="Generate invoice">
        <ResourceForm
          fields={INVOICE_FIELDS}
          initialValues={{}}
          onSubmit={handleCreateInvoice}
          onCancel={() => setInvoiceModalOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!paymentTarget} onClose={() => setPaymentTarget(null)} title={`Receive payment — ${paymentTarget?.patient_name || paymentTarget?.patient_id || ""}`}>
        <ResourceForm
          fields={PAYMENT_FIELDS}
          initialValues={{ method: "cash" }}
          onSubmit={handleRecordPayment}
          onCancel={() => setPaymentTarget(null)}
          submitting={submitting}
        />
      </Modal>
    </Layout>
  );
}
