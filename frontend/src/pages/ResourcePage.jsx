import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import client from "../api/client";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import ResourceForm from "../components/ResourceForm";

/**
 * config = {
 *   title, subtitle, endpoint, searchEndpoint?(query), idField='id',
 *   columns: [{ key, label, render?(row) }],
 *   fields: [...] (see ResourceForm),
 *   emptyValues: {},
 * }
 */
export default function ResourcePage({ config }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await client.get(config.endpoint);
      setRows(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [config.endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!config.searchEndpoint || !query.trim()) return load();
    setLoading(true);
    try {
      const res = await client.get(config.searchEndpoint(query.trim()));
      setRows(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError("");
    try {
      if (editing) {
        await client.put(`${config.endpoint}/${editing[config.idField || "id"]}`, values);
      } else {
        await client.post(config.endpoint, values);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete this record? This can't be undone.`)) return;
    try {
      await client.delete(`${config.endpoint}/${row[config.idField || "id"]}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout title={config.title} subtitle={config.subtitle}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {config.searchEndpoint && (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  className="input pl-9"
                  placeholder="Search by name…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-secondary">
                Search
              </button>
            </form>
          )}
          <button className="btn-secondary" onClick={load} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add {config.singular || config.title.replace(/s$/, "")}
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
              {config.columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-muted">
                  Loading&hellip;
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={config.columns.length + 1} className="px-4 py-8 text-center text-muted">
                  No records yet. Click "Add {config.singular || "record"}" to create one.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row[config.idField || "id"]} className="border-b border-border last:border-0 hover:bg-canvas/40">
                  {config.columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-ink">
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        className="btn-secondary !px-2 !py-1.5"
                        onClick={() => openEdit(row)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button className="btn-danger !px-2 !py-1.5" onClick={() => handleDelete(row)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${config.singular || "record"}` : `Add ${config.singular || "record"}`}
      >
        <ResourceForm
          fields={config.fields}
          initialValues={editing || config.emptyValues || {}}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          submitting={submitting}
        />
      </Modal>
    </Layout>
  );
}
