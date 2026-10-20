import { api, ApiError, formatErrors, getOrCreateProspect, toQuery } from "./api.js";
import { json, mockFetch, page } from "./test/utils.jsx";

describe("toQuery", () => {
  it("drops empty values", () => {
    expect(toQuery({ city: "Astoria", bedrooms: "", available: false, max_rent: 3000 })).toBe("?city=Astoria&max_rent=3000");
    expect(toQuery({})).toBe("");
  });
});

describe("formatErrors", () => {
  it("formats DRF field and detail errors", () => {
    expect(formatErrors({ scheduled_at: ["This unit already has a tour at that time."] })).toBe(
      "scheduled_at: This unit already has a tour at that time.",
    );
    expect(formatErrors({ detail: ["Only submitted applications can be approved."] })).toBe(
      "Only submitted applications can be approved.",
    );
  });
});

describe("api client", () => {
  it("throws ApiError with a readable message on 400", async () => {
    mockFetch({ "POST /api/applications/1/approve/": () => json({ detail: ["Monthly income must be at least 2.5x the rent."] }, 400) });
    const error = await api.approveApplication(1).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.message).toBe("Monthly income must be at least 2.5x the rent.");
  });

  it("reuses an existing prospect instead of creating a duplicate", async () => {
    const { calls } = mockFetch({
      "GET /api/prospects/?email=pat%40example.com": page([{ id: 7, email: "pat@example.com" }]),
    });
    const prospect = await getOrCreateProspect({ firstName: "Pat", lastName: "Lee", email: "pat@example.com" });
    expect(prospect.id).toBe(7);
    expect(calls.map((c) => c.key)).toEqual(["GET /api/prospects/?email=pat%40example.com"]);
  });

  it("creates a prospect when none exists", async () => {
    const { calls } = mockFetch({
      "GET /api/prospects/?email=new%40example.com": page([]),
      "POST /api/prospects/": () => json({ id: 9 }, 201),
    });
    const prospect = await getOrCreateProspect({ firstName: "New", lastName: "Renter", email: "new@example.com", phone: "" });
    expect(prospect.id).toBe(9);
    expect(calls[1].body).toEqual({ first_name: "New", last_name: "Renter", email: "new@example.com", phone: "" });
  });
});
