import { useState } from "react";
import ProspectFields from "./ProspectFields.jsx";
import { api, getOrCreateProspect } from "../api.js";
import { money } from "../format.js";

const BLANK = { firstName: "", lastName: "", email: "", phone: "", monthlyIncome: "" };
export const INCOME_RATIO = 2.5;

export default function ApplicationForm({ unit, onSubmitted }) {
  const [values, setValues] = useState(BLANK);
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const required = Number(unit.monthly_rent) * INCOME_RATIO;
  const income = Number(values.monthlyIncome);
  const belowRequirement = values.monthlyIncome !== "" && income < required;

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ state: "saving", message: "" });
    try {
      const prospect = await getOrCreateProspect(values);
      await api.createApplication({ prospect: prospect.id, unit: unit.id, monthly_income: values.monthlyIncome });
      setStatus({ state: "done", message: "Application submitted. A leasing agent will review it." });
      setValues(BLANK);
      onSubmitted?.();
    } catch (error) {
      setStatus({ state: "error", message: error.message });
    }
  };

  return (
    <form className="card" onSubmit={submit} aria-label="Apply for this unit">
      <h3>Apply</h3>
      <ProspectFields values={values} onChange={onChange} idPrefix="app" />
      <label htmlFor="app-monthlyIncome">
        Monthly income
        <input id="app-monthlyIncome" type="number" min="0" step="1" name="monthlyIncome" value={values.monthlyIncome} onChange={onChange} required />
      </label>
      <p className="muted small">Approval requires a monthly income of at least {money(required)} ({INCOME_RATIO}x rent).</p>
      {belowRequirement && (
        <p className="warning">This income is below the approval requirement. You can still apply.</p>
      )}
      <button type="submit" disabled={status.state === "saving"}>
        {status.state === "saving" ? "Submitting…" : "Submit application"}
      </button>
      {status.message && (
        <p role={status.state === "error" ? "alert" : "status"} className={status.state}>{status.message}</p>
      )}
    </form>
  );
}
