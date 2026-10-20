export const money = (value) =>
  Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const bedroomsLabel = (n) => (Number(n) === 0 ? "Studio" : `${n} bd`);

export const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const STATUS_LABELS = {
  available: "Available",
  pending: "Application pending",
  leased: "Leased",
  submitted: "Submitted",
  approved: "Approved",
  denied: "Denied",
  withdrawn: "Withdrawn",
};
