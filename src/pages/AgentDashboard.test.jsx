import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AgentDashboard from "./AgentDashboard.jsx";
import { json, mockFetch, page, renderAt } from "../test/utils.jsx";

const application = (overrides = {}) => ({
  id: 1, prospect: 5, prospect_name: "Pat Lee", unit: 1, unit_label: "Maple Court #101",
  monthly_income: "7000.00", status: "submitted", meets_income_requirement: true, ...overrides,
});

describe("AgentDashboard", () => {
  it("lists applications needing review", async () => {
    mockFetch({ "GET /api/applications/?status=submitted": page([application(), application({ id: 2, prospect_name: "Sam Diaz", meets_income_requirement: false })]) });
    renderAt("/agent", <AgentDashboard />);
    expect(await screen.findByText("Pat Lee")).toBeInTheDocument();
    expect(screen.getByText("Sam Diaz")).toBeInTheDocument();
    expect(screen.getByText("Below 2.5x")).toBeInTheDocument();
  });

  it("approves an application and refreshes the list", async () => {
    let approved = false;
    mockFetch({
      "GET /api/applications/?status=submitted": () => json(page(approved ? [] : [application()])),
      "POST /api/applications/1/approve/": () => { approved = true; return json(application({ status: "approved" })); },
    });
    renderAt("/agent", <AgentDashboard />);
    const user = userEvent.setup();
    const row = (await screen.findByText("Pat Lee")).closest("tr");
    await user.click(within(row).getByRole("button", { name: "Approve" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Application #1 approved.");
    expect(await screen.findByText("No applications here.")).toBeInTheDocument();
  });

  it("shows the reason when approval is rejected", async () => {
    mockFetch({
      "GET /api/applications/?status=submitted": page([application({ meets_income_requirement: false })]),
      "POST /api/applications/1/approve/": () => json({ detail: ["Monthly income must be at least 2.5x the rent."] }, 400),
    });
    renderAt("/agent", <AgentDashboard />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole("button", { name: "Approve" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Monthly income must be at least 2.5x the rent.");
  });

  it("switches tabs to filter by status", async () => {
    const { calls } = mockFetch({
      "GET /api/applications/?status=submitted": page([]),
      "GET /api/applications/?status=approved": page([application({ status: "approved" })]),
    });
    renderAt("/agent", <AgentDashboard />);
    const user = userEvent.setup();
    await screen.findByText("No applications here.");
    await user.click(screen.getByRole("tab", { name: "Approved" }));
    expect(await screen.findByText("Pat Lee")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Approve" })).not.toBeInTheDocument();
    expect(calls.at(-1).key).toBe("GET /api/applications/?status=approved");
  });
});
