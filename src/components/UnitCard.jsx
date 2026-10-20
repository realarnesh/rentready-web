import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge.jsx";
import { bedroomsLabel, money, shortDate } from "../format.js";

export default function UnitCard({ unit }) {
  return (
    <article className="card unit-card">
      <h2>
        <Link to={`/units/${unit.id}`}>{unit.property_name} · #{unit.number}</Link>
      </h2>
      <p className="rent">
        {money(unit.monthly_rent)}<span className="muted">/mo</span>
      </p>
      <p className="muted">
        {bedroomsLabel(unit.bedrooms)} · {unit.bathrooms} ba · {unit.square_feet} sq ft
      </p>
      <p className="muted">Available {shortDate(unit.available_on)}</p>
      <StatusBadge status={unit.status} />
    </article>
  );
}
