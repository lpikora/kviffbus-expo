import { act, renderHook } from "@testing-library/react-native";

import { useDepartureDateTimePicker } from "@/components/date-time-picker/use-departure-date-time-picker";
import i18n from "@/i18n";
import { TypeOfDepartureDateTimeType } from "@/types/departureDateTimeType";

describe("useDepartureDateTimePicker", () => {
  beforeAll(() => {
    void i18n.changeLanguage("en");
  });

  test("shows departure now when type is now", async () => {
    const { result } = await renderHook(() =>
      useDepartureDateTimePicker(
        { type: TypeOfDepartureDateTimeType.now, date: null },
        jest.fn(),
      ),
    );

    expect(result.current.displayText).toBe("Departure now");
  });

  test("shows the picker title when a date-time has no date", async () => {
    const { result } = await renderHook(() =>
      useDepartureDateTimePicker(
        { type: TypeOfDepartureDateTimeType.dateTime, date: null },
        jest.fn(),
      ),
    );

    expect(result.current.displayText).toBe("Departure Time");
  });

  test("shows a formatted date and notifies on change", async () => {
    const onChange = jest.fn();
    const date = new Date(2026, 6, 4, 10, 30, 0);

    const { result } = await renderHook(() =>
      useDepartureDateTimePicker(
        { type: TypeOfDepartureDateTimeType.dateTime, date },
        onChange,
      ),
    );

    expect(result.current.displayText).toContain("Departure on");
    expect(result.current.displayText).toMatch(/4/);

    await act(async () => {
      result.current.setDepartureNow();
    });
    expect(onChange).toHaveBeenCalledWith({
      type: TypeOfDepartureDateTimeType.now,
      date: null,
    });

    const nextDate = new Date(2026, 6, 5, 8, 0, 0);
    await act(async () => {
      result.current.setDepartureDateTime(nextDate);
    });
    expect(onChange).toHaveBeenCalledWith({
      type: TypeOfDepartureDateTimeType.dateTime,
      date: nextDate,
    });
  });
});
