import { useSearchParams } from "react-router-dom";
import Filters from "../components/Filters.jsx";
import UnitCard from "../components/UnitCard.jsx";
import { api } from "../api.js";
import { useApi } from "../useApi.js";

const FILTER_KEYS = ["city", "bedrooms", "max_rent", "available"];

export default function ListingsPage() {
  // Filters live in the URL so searches can be shared and survive refresh.
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) || ""]));
  const queryKey = searchParams.toString();

  const { data, error, loading } = useApi((signal) => api.listUnits(filters, signal), [queryKey]);

  const applyFilters = (values) => {
    const next = {};
    FILTER_KEYS.forEach((k) => {
      const v = k === "available" ? (values[k] ? "true" : "") : values[k];
      if (v) next[k] = v;
    });
    setSearchParams(next);
  };

  return (
    <>
      <h1>Find your next home</h1>
      <Filters initial={{ ...filters, available: filters.available === "true" }} onApply={applyFilters} />
      {loading && <p className="muted">Loading units…</p>}
      {error && <p role="alert" className="error">Could not load units. {error.message}</p>}
      {data && (
        <>
          <p className="muted">{data.count} {data.count === 1 ? "unit" : "units"} found</p>
          {data.results.length === 0 ? (
            <p className="muted">No units match those filters.</p>
          ) : (
            <section className="grid">
              {data.results.map((unit) => <UnitCard key={unit.id} unit={unit} />)}
            </section>
          )}
        </>
      )}
    </>
  );
}
