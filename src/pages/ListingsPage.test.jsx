import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ListingsPage from "./ListingsPage.jsx";
import { json, mockFetch, page, renderAt, unit } from "../test/utils.jsx";

describe("ListingsPage", () => {
  it("shows units returned by the API", async () => {
    mockFetch({ "GET /api/units/": page([unit(), unit({ id: 2, number: "204", bedrooms: 0, monthly_rent: "1950.00" })]) });
    renderAt("/", <ListingsPage />);
    expect(await screen.findByText("Maple Court · #101")).toBeInTheDocument();
    expect(screen.getByText("Maple Court · #204")).toBeInTheDocument();
    expect(screen.getByText("2 units found")).toBeInTheDocument();
    expect(screen.getByText(/Studio · 1.0 ba/)).toBeInTheDocument();
  });

  it("sends selected filters to the API", async () => {
    const { calls } = mockFetch({
      "GET /api/units/": page([unit()]),
      "GET /api/units/?bedrooms=2&max_rent=3000&available=true": page([]),
    });
    renderAt("/", <ListingsPage />);
    await screen.findByText("Maple Court · #101");

    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Bedrooms"), "2");
    await user.type(screen.getByLabelText("Max rent"), "3000");
    await user.click(screen.getByLabelText("Available only"));
    await user.click(screen.getByRole("button", { name: "Search" }));

    expect(await screen.findByText("No units match those filters.")).toBeInTheDocument();
    expect(calls.at(-1).key).toBe("GET /api/units/?bedrooms=2&max_rent=3000&available=true");
  });

  it("reads initial filters from the URL", async () => {
    const { calls } = mockFetch({ "GET /api/units/?city=Astoria": page([unit()]) });
    renderAt("/?city=Astoria", <ListingsPage />);
    await screen.findByText("Maple Court · #101");
    expect(screen.getByLabelText("City")).toHaveValue("Astoria");
    expect(calls[0].key).toBe("GET /api/units/?city=Astoria");
  });

  it("shows an error when the API fails", async () => {
    mockFetch({ "GET /api/units/": () => json({ detail: "Server error" }, 500) });
    renderAt("/", <ListingsPage />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load units. Server error");
  });
});
