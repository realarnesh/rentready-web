import { useState } from "react";
import ProspectFields from "./ProspectFields.jsx";
import { api, getOrCreateProspect } from "../api.js";

const BLANK = { firstName: "", lastName: "", email: "", phone: "", scheduledAt: "" };

export default function TourForm({ unit }) {
  const [values, setValues] = useState(BLANK);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: "saving", message: "" });
    try {
      const prospect = await getOrCreateProspect(values);
      await api.createTour({
        prospect: prospect.id,
        unit: unit.id,
        scheduled_at: new Date(values.scheduledAt).toISOString(),
      });
      setStatus({ state: "done", message: "Tour scheduled. We'll see you then." });
      setValues(BLANK);
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  return (
    <form className="card" onSubmit={submit} aria-label="Schedule a tour">
      <h3>Schedule a tour</h3>
      <ProspectFields values={values} onChange={onChange} idPrefix="tour" />
      <label htmlFor="tour-scheduledAt">
        Date and time
        <input id="tour-scheduledAt" type="datetime-local" name="scheduledAt" value={values.scheduledAt} onChange={onChange} required />
      </label>
      <button type="submit" disabled={status.state === "saving"}>
        {status.state === "saving" ? "Scheduling…" : "Schedule tour"}
      </button>
      {status.message && (
        <p role={status.state === "error" ? "alert" : "status"} className={status.state}>{status.message}</p>
      )}
    </form>
  );
}
