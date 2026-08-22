import { puppStop, thermalStop } from "@/services/__tests__/fixtures";
import { clientStorage } from "@/services/storage";
import { ErrorCode } from "@/types/appError";
import { TypeOfDepartureDateTimeType } from "@/types/departureDateTimeType";

import { flushPersistWrites } from "./memory-storage";

jest.mock("@/services/storage", () => {
  const { createMemoryStorage } = require("./memory-storage") as typeof import("./memory-storage");
  return { clientStorage: createMemoryStorage() };
});

import {
  searchStoreDefaultValues,
  useSearchStore,
} from "@/stores/search-store";

const memoryStorage = clientStorage as ReturnType<
  typeof import("./memory-storage").createMemoryStorage
>;

const sampleResult = {
  id: 1,
  lineId: "F1",
  from: thermalStop.id,
  to: puppStop.id,
  departureArrivalTimes: { timeDeparture: 720, timeArrival: 740 },
  busNumber: "1",
  goesOnlyOn: [] as string[],
  notGoesOn: [] as string[],
  departureDate: new Date("2026-07-04T12:00:00"),
};

describe("useSearchStore", () => {
  beforeEach(async () => {
    memoryStorage.store.clear();
    useSearchStore.getState().reset();
    await useSearchStore.persist.rehydrate();
    useSearchStore.getState().reset();
  });

  test("swapStops swaps from/to and clears results and error", () => {
    const store = useSearchStore.getState();
    store.setFromStop(thermalStop);
    store.setToStop(puppStop);
    useSearchStore.setState({
      results: [sampleResult],
      resultsQuery: {
        fromStopId: thermalStop.id,
        toStopId: puppStop.id,
        departureType: TypeOfDepartureDateTimeType.now,
        departureDate: null,
      },
      error: ErrorCode.SearchFailed,
    });

    useSearchStore.getState().swapStops();

    const next = useSearchStore.getState();
    expect(next.fromStop).toEqual(puppStop);
    expect(next.toStop).toEqual(thermalStop);
    expect(next.results).toEqual([]);
    expect(next.resultsQuery).toBeNull();
    expect(next.error).toBeNull();
  });

  test("setFromStop and setToStop clear previous results", () => {
    useSearchStore.setState({
      results: [sampleResult],
      resultsQuery: {
        fromStopId: 1,
        toStopId: 2,
        departureType: TypeOfDepartureDateTimeType.now,
        departureDate: null,
      },
      error: ErrorCode.Unknown,
    });

    useSearchStore.getState().setFromStop(thermalStop);

    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().resultsQuery).toBeNull();
    expect(useSearchStore.getState().error).toBeNull();
    expect(useSearchStore.getState().fromStop).toEqual(thermalStop);

    useSearchStore.setState({
      results: [sampleResult],
      resultsQuery: {
        fromStopId: 1,
        toStopId: 2,
        departureType: TypeOfDepartureDateTimeType.now,
        departureDate: null,
      },
    });

    useSearchStore.getState().setToStop(puppStop);

    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().toStop).toEqual(puppStop);
  });

  test("setDepartureDateTime merges type and date and clears results", () => {
    useSearchStore.setState({
      results: [sampleResult],
      resultsQuery: {
        fromStopId: 1,
        toStopId: 2,
        departureType: TypeOfDepartureDateTimeType.now,
        departureDate: null,
      },
      error: ErrorCode.Unknown,
    });

    useSearchStore.getState().setDepartureDateTime({
      type: TypeOfDepartureDateTimeType.dateTime,
    });
    expect(useSearchStore.getState().departureDateTime.type).toBe(
      TypeOfDepartureDateTimeType.dateTime,
    );
    expect(useSearchStore.getState().departureDateTime.date).toBeNull();
    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().resultsQuery).toBeNull();
    expect(useSearchStore.getState().error).toBeNull();

    useSearchStore.setState({
      results: [sampleResult],
      resultsQuery: {
        fromStopId: 1,
        toStopId: 2,
        departureType: TypeOfDepartureDateTimeType.dateTime,
        departureDate: null,
      },
    });

    const date = new Date("2026-07-04T10:00:00");
    useSearchStore.getState().setDepartureDateTime({ date });

    expect(useSearchStore.getState().departureDateTime).toEqual({
      type: TypeOfDepartureDateTimeType.dateTime,
      date,
    });
    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().resultsQuery).toBeNull();
  });

  test("setDepartureDateTime keeps results when the value is unchanged", () => {
    const resultsQuery = {
      fromStopId: 1,
      toStopId: 2,
      departureType: TypeOfDepartureDateTimeType.now,
      departureDate: null,
    };
    useSearchStore.setState({
      results: [sampleResult],
      resultsQuery,
    });

    useSearchStore.getState().setDepartureDateTime({
      type: TypeOfDepartureDateTimeType.now,
      date: null,
    });

    expect(useSearchStore.getState().results).toEqual([sampleResult]);
    expect(useSearchStore.getState().resultsQuery).toEqual(resultsQuery);
  });

  test("reset restores default now departure", () => {
    useSearchStore.getState().setFromStop(thermalStop);
    useSearchStore.getState().setDepartureDateTime({
      type: TypeOfDepartureDateTimeType.dateTime,
      date: new Date("2026-07-04T10:00:00"),
    });

    useSearchStore.getState().reset();

    expect(useSearchStore.getState()).toMatchObject(searchStoreDefaultValues);
    expect(useSearchStore.getState().departureDateTime.type).toBe(
      TypeOfDepartureDateTimeType.now,
    );
  });

  test("persist writes only fromStop and toStop, then rehydrates them", async () => {
    useSearchStore.getState().setFromStop(thermalStop);
    useSearchStore.getState().setToStop(puppStop);
    useSearchStore.setState({
      results: [sampleResult],
      error: ErrorCode.Unknown,
    });

    await flushPersistWrites();

    const persisted = JSON.parse(
      memoryStorage.getItem("kviffbus-search") ?? "{}",
    );
    expect(persisted.state).toEqual({
      fromStop: thermalStop,
      toStop: puppStop,
    });
    expect(persisted.state).not.toHaveProperty("results");

    const snapshot = memoryStorage.getItem("kviffbus-search");
    useSearchStore.getState().reset();
    await flushPersistWrites();
    expect(useSearchStore.getState().fromStop).toBeNull();

    memoryStorage.setItem("kviffbus-search", snapshot ?? "");
    await useSearchStore.persist.rehydrate();

    expect(useSearchStore.getState().fromStop).toEqual(thermalStop);
    expect(useSearchStore.getState().toStop).toEqual(puppStop);
    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().error).toBeNull();
  });
});
