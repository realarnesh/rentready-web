import { useState } from "react";

const EMPTY = { city: "", bedrooms: "", max_rent: "", available: false };

export default function Filters({ initial, onApply }) {
  const [values, setValues] = useState({ ...EMPTY, ...initial });
  const update = (field) => (event) => {
    const { type, checked, value } = event.target;
    setValues((v) => ({ ...v, [field]: type === "checkbox" ? checked : value }));
  };

  const submit = (event) => {
    event.preventDefault();
    onApply(values);
  };

  const reset = () => {
    setValues(EMPTY);
    onApply(EMPTY);
  };

  return (
    <form className="card filters" onSubmit={submit} aria-label="Filter units">
      <label>
        City
        <input value={values.city} onChange={update("city")} placeholder="Any" />
      </label>
      <label>
        Bedrooms
        <select value={values.bedrooms} onChange={update("bedrooms")}>
          <option value="">Any</option>
          <option value="0">Studio</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </label>
      <label>
        Max rent
        <input type="number" min="0" step="50" value={values.max_rent} onChange={update("max_rent")} />
      </label>
      <label className="checkbox">
        <input type="checkbox" checked={values.available} onChange={update("available")} />
        Available only
      </label>
      <div className="actions">
        <button type="submit">Search</button>
        <button type="button" className="secondary" onClick={reset}>Reset</button>
      </div>
    </form>
  );
}
