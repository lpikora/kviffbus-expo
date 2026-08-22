import {
  makeAppConfig,
  makeDataDto,
  puppStop,
  thermalStop,
} from "@/services/__tests__/fixtures";
import { getLocalData, getRemoteData } from "@/services/data-service";
import { clientStorage } from "@/services/storage";
import { connectionKey } from "@/utils/connection-key";

import { createMemoryStorage } from "./memory-storage";

jest.mock("@/services/storage", () => {
  const { createMemoryStorage } = require("./memory-storage") as typeof import("./memory-storage");
  return { clientStorage: createMemoryStorage() };
});

jest.mock("@/services/data-service", () => ({
  getLocalData: jest.fn(),
  getRemoteData: jest.fn(),
}));

import { useDataStore } from "@/stores/data-store";

const memoryStorage = clientStorage as ReturnType<typeof createMemoryStorage>;
const getLocalDataMock = getLocalData as jest.MockedFunction<typeof getLocalData>;
const getRemoteDataMock = getRemoteData as jest.MockedFunction<
  typeof getRemoteData
>;

const bundled = makeDataDto({
  appConfig: makeAppConfig({ importVersion: "2026.2" }),
});

const newerBundled = makeDataDto({
  appConfig: makeAppConfig({ importVersion: "2026.3" }),
  stops: [{ ...thermalStop, name: "Bundled Thermal" }, puppStop],
});

const persistedNewer = makeDataDto({
  appConfig: makeAppConfig({ importVersion: "2026.5" }),
  stops: [{ ...thermalStop, name: "Persisted Thermal" }, puppStop],
});

const remoteNewer = makeDataDto({
  appConfig: makeAppConfig({
    importVersion: "2026.4",
    dataUrl: "https://example.com/remote.json",
  }),
  stops: [{ ...thermalStop, name: "Remote Thermal" }, puppStop],
});

function seedPersisted(data: ReturnType<typeof makeDataDto>) {
  useDataStore.setState({
    stops: data.stops,
    connections: data.connections,
    stopExceptions: data.stopExceptions,
    appConfig: data.appConfig,
  });
}

describe("useDataStore", () => {
  beforeEach(async () => {
    memoryStorage.store.clear();
    getLocalDataMock.mockReset();
    getRemoteDataMock.mockReset();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    useDataStore.getState().reset();
    await useDataStore.persist.rehydrate();
    useDataStore.getState().reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("initData loads bundled data when persist is empty", async () => {
    getLocalDataMock.mockResolvedValue(bundled);

    await useDataStore.getState().initData();

    expect(useDataStore.getState().stops).toEqual(bundled.stops);
    expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.2");
    expect(useDataStore.getState().connections).toEqual(bundled.connections);
  });

  test("initData overwrites persist when bundled importVersion is newer", async () => {
    seedPersisted(bundled);
    getLocalDataMock.mockResolvedValue(newerBundled);

    await useDataStore.getState().initData();

    expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.3");
    expect(useDataStore.getState().stops[0].name).toBe("Bundled Thermal");
  });

  test("initData keeps persist when bundled importVersion is older", async () => {
    seedPersisted(persistedNewer);
    getLocalDataMock.mockResolvedValue(bundled);

    await useDataStore.getState().initData();

    expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.5");
    expect(useDataStore.getState().stops[0].name).toBe("Persisted Thermal");
  });

  test("initData keeps persist when bundled importVersion is the same", async () => {
    seedPersisted(bundled);
    getLocalDataMock.mockResolvedValue(
      makeDataDto({
        appConfig: makeAppConfig({ importVersion: "2026.2" }),
        stops: [{ ...thermalStop, name: "Same version bundled" }, puppStop],
      }),
    );

    await useDataStore.getState().initData();

    expect(useDataStore.getState().stops[0].name).toBe("Hotel Thermal");
  });

  test("syncWithApi applies remote data only when importVersion is newer", async () => {
    seedPersisted(bundled);
    getRemoteDataMock.mockResolvedValue(remoteNewer);

    await useDataStore.getState().syncWithApi();

    expect(getRemoteDataMock).toHaveBeenCalledWith(bundled.appConfig.dataUrl);
    expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.4");
    expect(useDataStore.getState().stops[0].name).toBe("Remote Thermal");
  });

  test("syncWithApi skips remote data with an older importVersion", async () => {
    seedPersisted(persistedNewer);
    getRemoteDataMock.mockResolvedValue(remoteNewer);

    await useDataStore.getState().syncWithApi();

    expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.5");
    expect(useDataStore.getState().stops[0].name).toBe("Persisted Thermal");
  });

  test("syncWithApi keeps current data when remote fetch fails", async () => {
    seedPersisted(bundled);
    getRemoteDataMock.mockRejectedValue(new Error("offline"));

    await useDataStore.getState().syncWithApi();

    expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.2");
    expect(console.warn).toHaveBeenCalled();
  });

  test("initData rethrows local load failures", async () => {
    getLocalDataMock.mockRejectedValue(new Error("missing bundle"));

    await expect(useDataStore.getState().initData()).rejects.toThrow(
      "missing bundle",
    );
    expect(useDataStore.getState().stops).toEqual([]);
  });

  test("syncWithApi applies remote data when persist has no appConfig", async () => {
    getRemoteDataMock.mockResolvedValue(remoteNewer);

    await useDataStore.getState().syncWithApi();

    expect(getRemoteDataMock).toHaveBeenCalledWith(undefined);
    expect(useDataStore.getState().connections).toEqual(
      remoteNewer.connections,
    );
    expect(
      useDataStore.getState().connections[
        connectionKey(thermalStop.id, puppStop.id)
      ],
    ).toBeDefined();
  });
});
