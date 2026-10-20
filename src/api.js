// Thin client for the RentReady Django REST API.

export class ApiError extends Error {
  constructor(status, body) {
    super(formatErrors(body) || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

// DRF returns errors as {"field": ["msg"]} or {"detail": "msg" | ["msg"]}.
export function formatErrors(body) {
  if (!body || typeof body !== "object") return "";
  return Object.entries(body)
    .map(([field, value]) => {
      const text = Array.isArray(value) ? value.join(" ") : String(value);
      return field === "detail" || field === "non_field_errors" ? text : `${field}: ${text}`;
    })
    .join(" ");
}

async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}

export function toQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== false) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const api = {
  listUnits: (filters = {}, signal) => request(`/units/${toQuery(filters)}`, { signal }),
  getUnit: (id, signal) => request(`/units/${id}/`, { signal }),
  findProspectByEmail: async (email) => {
    const data = await request(`/prospects/${toQuery({ email })}`);
    return data.results[0] || null;
  },
  createProspect: (prospect) => request("/prospects/", { method: "POST", body: prospect }),
  createTour: (tour) => request("/tours/", { method: "POST", body: tour }),
  createApplication: (application) => request("/applications/", { method: "POST", body: application }),
  listApplications: (filters = {}, signal) => request(`/applications/${toQuery(filters)}`, { signal }),
  approveApplication: (id) => request(`/applications/${id}/approve/`, { method: "POST" }),
  denyApplication: (id) => request(`/applications/${id}/deny/`, { method: "POST" }),
};

// Reuse an existing prospect with the same email, otherwise create one.
export async function getOrCreateProspect({ firstName, lastName, email, phone }) {
  const existing = await api.findProspectByEmail(email);
  if (existing) return existing;
  return api.createProspect({ first_name: firstName, last_name: lastName, email, phone });
}
