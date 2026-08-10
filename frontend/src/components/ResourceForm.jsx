import { useEffect, useState } from "react";

/**
 * fields: [{ name, label, type: 'text'|'number'|'date'|'textarea'|'select', options?, required? }]
 */
export default function ResourceForm({ fields, initialValues, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    setValues(initialValues || {});
  }, [initialValues]);

  const handleChange = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.name} className={f.fullWidth ? "sm:col-span-2" : ""}>
            <label className="label">
              {f.label}
              {f.required && <span className="text-clay-400"> *</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                className="input"
                rows={3}
                required={f.required}
                value={values[f.name] ?? ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
              />
            ) : f.type === "select" ? (
              <select
                className="input"
                required={f.required}
                value={values[f.name] ?? ""}
                onChange={(e) => handleChange(f.name, e.target.value)}
              >
                <option value="" disabled>
                  Select&hellip;
                </option>
                {f.options.map((opt) => (
                  <option key={opt.value ?? opt} value={opt.value ?? opt}>
                    {opt.label ?? opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={f.type || "text"}
                step={f.type === "number" ? "any" : undefined}
                required={f.required}
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  handleChange(f.name, f.type === "number" ? e.target.valueAsNumber || 0 : e.target.value)
                }
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
