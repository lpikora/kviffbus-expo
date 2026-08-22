import { resultsMatchQuery } from "@/utils/results-match-query";

describe("resultsMatchQuery", () => {
  test("matches when both stop ids equal the stored query", () => {
    expect(resultsMatchQuery(1, 2, { fromStopId: 1, toStopId: 2 })).toBe(true);
  });

  test("rejects stale results after a swap", () => {
    expect(resultsMatchQuery(2, 1, { fromStopId: 1, toStopId: 2 })).toBe(false);
  });

  test("rejects missing stops or query", () => {
    expect(resultsMatchQuery(undefined, 2, { fromStopId: 1, toStopId: 2 })).toBe(
      false,
    );
    expect(resultsMatchQuery(1, undefined, { fromStopId: 1, toStopId: 2 })).toBe(
      false,
    );
    expect(resultsMatchQuery(1, 2, null)).toBe(false);
  });
});
