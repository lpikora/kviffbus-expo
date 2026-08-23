import { render } from "@testing-library/react-native";

import { ResultsListItem } from "@/components/results-item";
import i18n from "@/i18n";

const itemProps = {
  timeDeparture: 750,
  timeArrival: 775,
  lineId: "A1",
  fromName: "Thermal",
  toName: "Hotel Thermal",
  departureDate: new Date("2026-08-21T12:30:00"),
};

describe("<ResultsListItem />", () => {
  beforeAll(() => {
    void i18n.changeLanguage("en");
  });

  test("renders connection details", async () => {
    const { getByText } = await render(
      <ResultsListItem {...itemProps} now={new Date("2026-08-21T10:00:00")} />,
    );

    getByText("A1");
    getByText("12:30");
    getByText("Thermal");
    getByText("12:55");
    getByText("Hotel Thermal");
    getByText("25 min");
    getByText("in 2 h 30 min");
  });

  test("updates time to departure when now changes", async () => {
    const { getByText, queryByText, rerender } = await render(
      <ResultsListItem {...itemProps} now={new Date("2026-08-21T10:00:00")} />,
    );

    getByText("in 2 h 30 min");

    await rerender(
      <ResultsListItem {...itemProps} now={new Date("2026-08-21T10:01:00")} />,
    );

    getByText("in 2 h 29 min");
    expect(queryByText("in 2 h 30 min")).toBeNull();
  });
});
