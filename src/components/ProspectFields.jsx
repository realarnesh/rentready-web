export default function ProspectFields({ values, onChange, idPrefix }) {
  const field = (name, label, props = {}) => (
    <label htmlFor={`${idPrefix}-${name}`}>
      {label}
      <input id={`${idPrefix}-${name}`} name={name} value={values[name]} onChange={onChange} {...props} />
    </label>
  );
  return (
    <div className="field-grid">
      {field("firstName", "First name", { required: true })}
      {field("lastName", "Last name", { required: true })}
      {field("email", "Email", { type: "email", required: true })}
      {field("phone", "Phone", { type: "tel" })}
    </div>
  );
}
