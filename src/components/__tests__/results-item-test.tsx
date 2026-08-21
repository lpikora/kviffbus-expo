import { render } from "@testing-library/react-native";

import { ResultsListItem } from "@/components/results-item";
import i18n from "@/i18n";

describe("<ResultsListItem />", () => {
  beforeAll(() => {
    void i18n.changeLanguage("en");
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-21T10:00:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders connection details", async () => {
    const { getByText } = await render(
      <ResultsListItem
        timeDeparture="12:30"
        timeArrival="12:55"
        lineId="A1"
        fromName="Thermal"
        toName="Hotel Thermal"
        departureDate={new Date("2026-08-21T12:30:00")}
      />,
    );

    getByText("A1");
    getByText("12:30");
    getByText("Thermal");
    getByText("12:55");
    getByText("Hotel Thermal");
    getByText("25 min");
    getByText("in 2 h 30 min");
  });
});
