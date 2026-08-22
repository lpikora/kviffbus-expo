import i18n from "@/i18n";
import {
  formatMinutesToHhMm,
  getDateTimeStringFromNowToDate,
  getDurationBetweenTwoTimes,
  toDateKey,
} from "@/utils/format-time";

describe("getDurationBetweenTwoTimes", () => {
  test("returns duration across midnight", () => {
    expect(getDurationBetweenTwoTimes(1430, 10)).toBe("20 min");
  });

  test("returns duration on the same day", () => {
    expect(getDurationBetweenTwoTimes(750, 775)).toBe("25 min");
  });
});

describe("formatMinutesToHhMm", () => {
  test("formats minutes from midnight", () => {
    expect(formatMinutesToHhMm(720)).toBe("12:00");
    expect(formatMinutesToHhMm(5)).toBe("00:05");
  });
});

describe("toDateKey", () => {
  test("formats a local calendar date", () => {
    expect(toDateKey(new Date(2026, 6, 4, 10, 0, 0))).toBe("2026-07-04");
  });
});

describe("getDateTimeStringFromNowToDate", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 6, 4, 10, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("formats a same-day departure more than an hour away", () => {
    expect(
      getDateTimeStringFromNowToDate(new Date(2026, 6, 4, 12, 5, 0)),
    ).toBe(`${i18n.t("time.in")} 2 h 5 min`);
  });

  test("uses a calendar string for another day", () => {
    const label = getDateTimeStringFromNowToDate(
      new Date(2026, 6, 5, 12, 0, 0),
    );

    expect(label).not.toContain("h");
    expect(label.length).toBeGreaterThan(0);
  });
});
