import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export const json = (body, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

export const page = (results) => ({ count: results.length, next: null, previous: null, results });

// Route fetch calls to handlers keyed by "METHOD /path" (query string included).
export function mockFetch(routes) {
  const calls = [];
  const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((url, options = {}) => {
    const method = options.method || "GET";
    const key = `${method} ${url}`;
    calls.push({ key, body: options.body ? JSON.parse(options.body) : undefined });
    const handler = routes[key];
    if (!handler) return json({ detail: `Unmocked ${key}` }, 500);
    return typeof handler === "function" ? handler(options) : json(handler);
  });
  return { fetchMock, calls };
}

export function renderAt(path, element, routePath = "*") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

export const unit = (overrides = {}) => ({
  id: 1, property: 1, property_name: "Maple Court", number: "101", bedrooms: 1, bathrooms: "1.0",
  square_feet: 640, monthly_rent: "2400.00", available_on: "2026-11-01", status: "available", ...overrides,
});
