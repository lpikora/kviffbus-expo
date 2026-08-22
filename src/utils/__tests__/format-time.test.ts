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

  test("returns zero minutes when departure and arrival match", () => {
    expect(getDurationBetweenTwoTimes(720, 720)).toBe("0 min");
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

  test("omits minutes when a same-day departure is an exact number of hours away", async () => {
    expect(
      getDateTimeStringFromNowToDate(new Date(2026, 6, 4, 11, 0, 0)),
    ).toBe(`${i18n.t("time.in")} 1 h`);

    await i18n.changeLanguage("cs");

    expect(
      getDateTimeStringFromNowToDate(new Date(2026, 6, 4, 11, 0, 0)),
    ).toBe("za 1 h");
  });

  test("uses a calendar string for another day", () => {
    expect(
      getDateTimeStringFromNowToDate(new Date(2026, 6, 5, 12, 0, 0)),
    ).toBe("Tomorrow at 12:00");
  });

  test("uses relative time for a same-day departure under an hour", () => {
    expect(
      getDateTimeStringFromNowToDate(new Date(2026, 6, 4, 10, 30, 0)),
    ).toBe("in 30 minutes");
  });

  test("uses Czech calendar copy when the language is cs", async () => {
    await i18n.changeLanguage("cs");

    expect(
      getDateTimeStringFromNowToDate(new Date(2026, 6, 5, 12, 0, 0)),
    ).toBe("Zítra v 12:00");
  });
});
