import { Link, useParams } from "react-router-dom";
import ApplicationForm from "../components/ApplicationForm.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import TourForm from "../components/TourForm.jsx";
import { api } from "../api.js";
import { bedroomsLabel, money, shortDate } from "../format.js";
import { useApi } from "../useApi.js";

export default function UnitDetailPage() {
  const { id } = useParams();
  const { data: unit, error, loading, reload } = useApi((signal) => api.getUnit(id, signal), [id]);

  if (loading && !unit) return <p className="muted">Loading unit…</p>;
  if (error) return <p role="alert" className="error">Could not load this unit. {error.message}</p>;

  const leased = unit.status === "leased";

  return (
    <>
      <Link to="/" className="back">← Back to listings</Link>
      <section className="card unit-detail">
        <h1>{unit.property_name} · #{unit.number}</h1>
        <p className="rent">{money(unit.monthly_rent)}<span className="muted">/mo</span></p>
        <p className="muted">
          {bedroomsLabel(unit.bedrooms)} · {unit.bathrooms} ba · {unit.square_feet} sq ft · Available {shortDate(unit.available_on)}
        </p>
        <StatusBadge status={unit.status} />
      </section>
      {leased ? (
        <p className="muted">This unit has been leased and is no longer accepting tours or applications.</p>
      ) : (
        <div className="two-col">
          <TourForm unit={unit} />
          <ApplicationForm unit={unit} onSubmitted={reload} />
        </div>
      )}
    </>
  );
}
