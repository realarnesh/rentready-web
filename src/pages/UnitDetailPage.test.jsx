import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UnitDetailPage from "./UnitDetailPage.jsx";
import { json, mockFetch, page, renderAt, unit } from "../test/utils.jsx";

const renderUnit = () => renderAt("/units/1", <UnitDetailPage />, "/units/:id");

async function fillProspect(form, user) {
  await user.type(within(form).getByLabelText("First name"), "Pat");
  await user.type(within(form).getByLabelText("Last name"), "Lee");
  await user.type(within(form).getByLabelText("Email"), "pat@example.com");
}

describe("UnitDetailPage", () => {
  it("submits an application for a new prospect", async () => {
    const { calls } = mockFetch({
      "GET /api/units/1/": unit(),
      "GET /api/prospects/?email=pat%40example.com": page([]),
      "POST /api/prospects/": () => json({ id: 5 }, 201),
      "POST /api/applications/": () => json({ id: 11, status: "submitted" }, 201),
    });
    renderUnit();
    const user = userEvent.setup();
    const form = await screen.findByRole("form", { name: "Apply for this unit" });
    await fillProspect(form, user);
    await user.type(within(form).getByLabelText("Monthly income"), "7000");
    await user.click(within(form).getByRole("button", { name: "Submit application" }));

    expect(await within(form).findByRole("status")).toHaveTextContent("Application submitted");
    expect(calls.find((c) => c.key === "POST /api/applications/").body).toEqual({ prospect: 5, unit: 1, monthly_income: "7000" });
  });

  it("warns when income is below 2.5x rent", async () => {
    mockFetch({ "GET /api/units/1/": unit({ monthly_rent: "2400.00" }) });
    renderUnit();
    const user = userEvent.setup();
    const form = await screen.findByRole("form", { name: "Apply for this unit" });
    expect(within(form).getByText(/at least \$6,000/)).toBeInTheDocument();
    await user.type(within(form).getByLabelText("Monthly income"), "5000");
    expect(within(form).getByText(/below the approval requirement/)).toBeInTheDocument();
  });

  it("shows the API error when a tour time is already booked", async () => {
    mockFetch({
      "GET /api/units/1/": unit(),
      "GET /api/prospects/?email=pat%40example.com": page([{ id: 5 }]),
      "POST /api/tours/": () => json({ scheduled_at: ["This unit already has a tour at that time."] }, 400),
    });
    renderUnit();
    const user = userEvent.setup();
    const form = await screen.findByRole("form", { name: "Schedule a tour" });
    await fillProspect(form, user);
    await user.type(within(form).getByLabelText("Date and time"), "2030-01-15T14:00");
    await user.click(within(form).getByRole("button", { name: "Schedule tour" }));
    expect(await within(form).findByRole("alert")).toHaveTextContent("This unit already has a tour at that time.");
  });

  it("hides the forms for a leased unit", async () => {
    mockFetch({ "GET /api/units/1/": unit({ status: "leased" }) });
    renderUnit();
    expect(await screen.findByText(/no longer accepting tours or applications/)).toBeInTheDocument();
    expect(screen.queryByRole("form", { name: "Apply for this unit" })).not.toBeInTheDocument();
  });
});
