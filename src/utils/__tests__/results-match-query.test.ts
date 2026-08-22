import { TypeOfDepartureDateTimeType } from "@/types/departureDateTimeType";
import { resultsMatchQuery } from "@/utils/results-match-query";

const now = {
  type: TypeOfDepartureDateTimeType.now,
  date: null,
};

const evening = {
  type: TypeOfDepartureDateTimeType.dateTime,
  date: new Date("2026-07-04T18:00:00"),
};

const query = {
  fromStopId: 1,
  toStopId: 2,
  departureType: TypeOfDepartureDateTimeType.now,
  departureDate: null,
};

describe("resultsMatchQuery", () => {
  test("matches when stop ids and departure equal the stored query", () => {
    expect(resultsMatchQuery(1, 2, now, query)).toBe(true);
  });

  test("rejects stale results after a swap", () => {
    expect(resultsMatchQuery(2, 1, now, query)).toBe(false);
  });

  test("rejects a previous now search after the departure time changes", () => {
    expect(resultsMatchQuery(1, 2, evening, query)).toBe(false);
  });

  test("rejects a different specific departure time", () => {
    expect(
      resultsMatchQuery(1, 2, evening, {
        ...query,
        departureType: TypeOfDepartureDateTimeType.dateTime,
        departureDate: new Date("2026-07-04T10:00:00"),
      }),
    ).toBe(false);
  });

  test("matches the same specific departure time by value", () => {
    expect(
      resultsMatchQuery(1, 2, evening, {
        ...query,
        departureType: TypeOfDepartureDateTimeType.dateTime,
        departureDate: new Date("2026-07-04T18:00:00"),
      }),
    ).toBe(true);
  });

  test("rejects missing stops or query", () => {
    expect(resultsMatchQuery(undefined, 2, now, query)).toBe(false);
    expect(resultsMatchQuery(1, undefined, now, query)).toBe(false);
    expect(resultsMatchQuery(1, 2, now, null)).toBe(false);
  });
});
