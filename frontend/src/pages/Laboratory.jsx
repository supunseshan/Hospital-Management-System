import { useEffect, useState, useCallback } from "react";
import { Plus, FlaskConical } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ResourceForm from "../components/ResourceForm";

const STATUS_STYLES = {
  requested: "bg-amber-100 text-amber-700",
  sample_collected: "bg-teal-100 text-teal-700",
  in_progress: "bg-teal-100 text-teal-700",
  completed: "bg-teal-700 text-white",
};

const REQUEST_FIELDS = [
  { name: "patient_id", label: "Patient ID", required: true },
  { name: "doctor_id", label: "Requesting doctor ID" },
  { name: "test_name", label: "Test name", required: true },
  { name: "sample_type", label: "Sample type" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["requested", "sample_collected", "in_progress", "completed"],
  },
];

const RESULT_FIELDS = [
  { name: "result", label: "Result", type: "textarea", required: true, fullWidth: true },
  { name: "result_date", label: "Result date", type: "date", required: true },
];

export default function Laboratory() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [resultTarget, setResultTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get("/lab-tests");
      setTests(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateRequest = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await client.post("/lab-tests", { ...values, status: values.status || "requested" });
      setRequestOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnterResult = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      await client.patch(
        `/lab-tests/${resultTarget.id}/result?result=${encodeURIComponent(values.result)}&result_date=${encodeURIComponent(values.result_date)}`
      );
      setResultTarget(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Laboratory" subtitle="Test requests, sample tracking and results (spec 3.6)">
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => setRequestOpen(true)}>
          <Plus size={16} /> New test request
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
              <th className="px-4 py-3 font-semibold">Patient ID</th>
              <th className="px-4 py-3 font-semibold">Test</th>
              <th className="px-4 py-3 font-semibold">Sample</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Result</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">Loading&hellip;</td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">No lab requests yet.</td>
              </tr>
            ) : (
              tests.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  <td className="px-4 py-3">{t.patient_id}</td>
                  <td className="px-4 py-3 font-medium">{t.test_name}</td>
                  <td className="px-4 py-3">{t.sample_type || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_STYLES[t.status] || "bg-canvas text-muted"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{t.result || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="btn-secondary !px-2 !py-1.5"
                      onClick={() => setResultTarget(t)}
                      disabled={t.status === "completed"}
                      title="Enter result"
                    >
                      <FlaskConical size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={requestOpen} onClose={() => setRequestOpen(false)} title="New lab test request">
        <ResourceForm
          fields={REQUEST_FIELDS}
          initialValues={{ status: "requested" }}
          onSubmit={handleCreateRequest}
          onCancel={() => setRequestOpen(false)}
          submitting={submitting}
        />
      </Modal>

      <Modal open={!!resultTarget} onClose={() => setResultTarget(null)} title={`Enter result — ${resultTarget?.test_name || ""}`}>
        <ResourceForm
          fields={RESULT_FIELDS}
          initialValues={{}}
          onSubmit={handleEnterResult}
          onCancel={() => setResultTarget(null)}
          submitting={submitting}
        />
      </Modal>
    </Layout>
  );
}
