import { AppError } from "@/errors/appError";
import {
  makeAppConfig,
  makeConnection,
  puppStop,
  thermalStop,
} from "@/services/__tests__/fixtures";
import { searchConnections } from "@/services/connection-service";
import { ErrorCode } from "@/types/appError";
import { connectionKey } from "@/utils/connection-key";

jest.mock("@/services/storage", () => {
  const { createMemoryStorage } = require("../../stores/__tests__/memory-storage") as typeof import("../../stores/__tests__/memory-storage");
  return { clientStorage: createMemoryStorage() };
});

jest.mock("@/services/connection-service", () => ({
  searchConnections: jest.fn(),
}));

import { runConnectionSearch } from "@/actions/run-connection-search";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";

const searchConnectionsMock = searchConnections as jest.MockedFunction<
  typeof searchConnections
>;

const searchResult = {
  ...makeConnection(),
  departureDate: new Date("2026-07-04T12:00:00"),
};

describe("runConnectionSearch", () => {
  beforeEach(() => {
    searchConnectionsMock.mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    useSearchStore.getState().reset();
    useDataStore.getState().reset();
    useDataStore.setState({
      stops: [thermalStop, puppStop],
      connections: {
        [connectionKey(thermalStop.id, puppStop.id)]: [makeConnection()],
      },
      stopExceptions: [],
      appConfig: makeAppConfig(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("writes results and query, then clears loading", () => {
    useSearchStore.getState().setFromStop(thermalStop);
    useSearchStore.getState().setToStop(puppStop);
    searchConnectionsMock.mockReturnValue([searchResult]);

    runConnectionSearch();

    const state = useSearchStore.getState();
    expect(state.results).toEqual([searchResult]);
    expect(state.resultsQuery).toEqual({
      fromStopId: thermalStop.id,
      toStopId: puppStop.id,
    });
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(searchConnectionsMock).toHaveBeenCalled();
  });

  test("maps AppError onto the search store", () => {
    useSearchStore.getState().setFromStop(thermalStop);
    useSearchStore.getState().setToStop(puppStop);
    searchConnectionsMock.mockImplementation(() => {
      throw new AppError(ErrorCode.DataNotReady);
    });

    runConnectionSearch();

    const state = useSearchStore.getState();
    expect(state.results).toEqual([]);
    expect(state.error).toBe(ErrorCode.DataNotReady);
    expect(state.resultsQuery).toEqual({
      fromStopId: thermalStop.id,
      toStopId: puppStop.id,
    });
    expect(state.isLoading).toBe(false);
  });

  test("maps unknown errors to ErrorCode.Unknown", () => {
    useSearchStore.getState().setFromStop(thermalStop);
    useSearchStore.getState().setToStop(puppStop);
    searchConnectionsMock.mockImplementation(() => {
      throw new Error("unexpected");
    });

    runConnectionSearch();

    expect(useSearchStore.getState().error).toBe(ErrorCode.Unknown);
    expect(useSearchStore.getState().results).toEqual([]);
    expect(useSearchStore.getState().isLoading).toBe(false);
  });

  test("keeps resultsQuery null when a stop is missing", () => {
    useSearchStore.getState().setFromStop(thermalStop);
    searchConnectionsMock.mockImplementation(() => {
      throw new AppError(ErrorCode.MissingStops);
    });

    runConnectionSearch();

    expect(useSearchStore.getState().resultsQuery).toBeNull();
    expect(useSearchStore.getState().error).toBe(ErrorCode.MissingStops);
    expect(useSearchStore.getState().results).toEqual([]);
  });
});
