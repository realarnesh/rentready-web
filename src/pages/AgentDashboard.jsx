import { useState } from "react";
import StatusBadge from "../components/StatusBadge.jsx";
import { api } from "../api.js";
import { money } from "../format.js";
import { useApi } from "../useApi.js";

const TABS = [
  { value: "", label: "All" },
  { value: "submitted", label: "Needs review" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
];

export default function AgentDashboard() {
  const [tab, setTab] = useState("submitted");
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState(null);
  const { data, error, loading, reload } = useApi(
    (signal) => api.listApplications({ status: tab }, signal),
    [tab],
  );

  const decide = async (application, action) => {
    setBusyId(application.id);
    setMessage(null);
    try {
      const fn = action === "approve" ? api.approveApplication : api.denyApplication;
      await fn(application.id);
      setMessage({ type: "status", text: `Application #${application.id} ${action === "approve" ? "approved" : "denied"}.` });
      reload(); // approving can deny competing applications, so refetch the list
    } catch (err) {
      setMessage({ type: "alert", text: err.message });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <h1>Rental applications</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            className={tab === t.value ? "tab active" : "tab"}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {message && <p role={message.type} className={message.type === "alert" ? "error" : "done"}>{message.text}</p>}
      {loading && <p className="muted">Loading applications…</p>}
      {error && <p role="alert" className="error">Could not load applications. {error.message}</p>}
      {data && data.results.length === 0 && <p className="muted">No applications here.</p>}
      {data && data.results.length > 0 && (
        <table className="card table">
          <thead>
            <tr>
              <th>#</th><th>Prospect</th><th>Unit</th><th>Monthly income</th><th>Income check</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.prospect_name || `Prospect ${a.prospect}`}</td>
                <td>{a.unit_label || `Unit ${a.unit}`}</td>
                <td>{money(a.monthly_income)}</td>
                <td>{a.meets_income_requirement ? "Meets 2.5x" : <span className="warning">Below 2.5x</span>}</td>
                <td><StatusBadge status={a.status} /></td>
                <td className="row-actions">
                  {a.status === "submitted" && (
                    <>
                      <button onClick={() => decide(a, "approve")} disabled={busyId === a.id}>Approve</button>
                      <button className="secondary" onClick={() => decide(a, "deny")} disabled={busyId === a.id}>Deny</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
