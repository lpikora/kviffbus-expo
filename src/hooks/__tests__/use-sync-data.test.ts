import { act, renderHook, waitFor } from "@testing-library/react-native";
import { SplashScreen } from "expo-router";
import { AppState, type AppStateStatus, type NativeEventSubscription } from "react-native";

import { AppError } from "@/errors/appError";
import {
  SPLASH_HIDE_TIMEOUT_MS,
  SYNC_INTERVAL_MS,
  useInitData,
} from "@/hooks/use-sync-data";
import { makeAppConfig, makeDataDto } from "@/services/__tests__/fixtures";
import { getLocalData, getRemoteData } from "@/services/data-service";
import { clientStorage } from "@/services/storage";
import { createMemoryStorage } from "@/stores/__tests__/memory-storage";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";
import { ErrorCode } from "@/types/appError";

jest.mock("expo-router", () => ({
  SplashScreen: {
    hide: jest.fn(),
  },
}));

jest.mock("@/services/storage", () => {
  const { createMemoryStorage } = require("@/stores/__tests__/memory-storage") as typeof import("@/stores/__tests__/memory-storage");
  return { clientStorage: createMemoryStorage() };
});

jest.mock("@/services/data-service", () => ({
  getLocalData: jest.fn(),
  getRemoteData: jest.fn(),
}));

const memoryStorage = clientStorage as ReturnType<typeof createMemoryStorage>;
const getLocalDataMock = getLocalData as jest.MockedFunction<typeof getLocalData>;
const getRemoteDataMock = getRemoteData as jest.MockedFunction<
  typeof getRemoteData
>;
const hideSplash = SplashScreen.hide as jest.Mock;

const bundled = makeDataDto({
  appConfig: makeAppConfig({ importVersion: "2026.2" }),
});

const appStateListeners: ((state: AppStateStatus) => void)[] = [];

function emitAppState(state: AppStateStatus) {
  for (const listener of appStateListeners) {
    listener(state);
  }
}

describe("useInitData", () => {
  beforeEach(async () => {
    memoryStorage.store.clear();
    hideSplash.mockClear();
    appStateListeners.length = 0;
    getLocalDataMock.mockReset().mockResolvedValue(bundled);
    getRemoteDataMock.mockReset().mockResolvedValue(bundled);
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(AppState, "addEventListener").mockImplementation((_event, handler) => {
      appStateListeners.push(handler);
      return {
        remove: () => {
          const index = appStateListeners.indexOf(handler);
          if (index >= 0) {
            appStateListeners.splice(index, 1);
          }
        },
      } as NativeEventSubscription;
    });
    useDataStore.getState().reset();
    useSearchStore.getState().reset();
    await useDataStore.persist.rehydrate();
    await useSearchStore.persist.rehydrate();
    useDataStore.getState().reset();
    useSearchStore.getState().reset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("loads the local bundle, hides splash, then syncs", async () => {
    await renderHook(() => useInitData());

    await waitFor(() => {
      expect(useDataStore.getState().appConfig?.importVersion).toBe("2026.2");
    });
    await waitFor(() => {
      expect(hideSplash).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(getRemoteDataMock).toHaveBeenCalled();
    });
    expect(useSearchStore.getState().error).toBeNull();
  });

  test("does not hide splash or sync if unmounted while init is in flight", async () => {
    let resolveLocal: ((data: typeof bundled) => void) | undefined;
    getLocalDataMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveLocal = resolve;
        }),
    );

    const { unmount } = await renderHook(() => useInitData());

    await waitFor(() => {
      expect(getLocalDataMock).toHaveBeenCalled();
    });

    await unmount();

    await act(async () => {
      resolveLocal?.(bundled);
    });

    expect(hideSplash).not.toHaveBeenCalled();
    expect(getRemoteDataMock).not.toHaveBeenCalled();
  });

  test("hides splash after 4s even if init never finishes", async () => {
    getLocalDataMock.mockReturnValue(new Promise(() => {}));
    jest.useFakeTimers();

    try {
      await renderHook(() => useInitData());

      await act(async () => {
        jest.advanceTimersByTime(SPLASH_HIDE_TIMEOUT_MS - 1);
      });
      expect(hideSplash).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(1);
      });
      expect(hideSplash).toHaveBeenCalledTimes(1);
      expect(getRemoteDataMock).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  test("hides splash after 4s even if stores never hydrate", async () => {
    jest.spyOn(useDataStore.persist, "hasHydrated").mockReturnValue(false);
    jest.spyOn(useSearchStore.persist, "hasHydrated").mockReturnValue(false);
    jest.useFakeTimers();

    try {
      await renderHook(() => useInitData());

      await act(async () => {
        jest.advanceTimersByTime(SPLASH_HIDE_TIMEOUT_MS);
      });

      expect(hideSplash).toHaveBeenCalledTimes(1);
      expect(getLocalDataMock).not.toHaveBeenCalled();
      expect(getRemoteDataMock).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  test("records an error and still finishes when local load fails", async () => {
    let resolveRemote: ((data: typeof bundled) => void) | undefined;
    getLocalDataMock.mockRejectedValue(new AppError(ErrorCode.DataLoadFailed));
    getRemoteDataMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRemote = resolve;
        }),
    );

    await renderHook(() => useInitData());

    await waitFor(() => {
      expect(useSearchStore.getState().error).toBe(ErrorCode.DataLoadFailed);
    });
    await waitFor(() => {
      expect(hideSplash).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(getRemoteDataMock).toHaveBeenCalled();
    });
    expect(useSearchStore.getState().error).toBe(ErrorCode.DataLoadFailed);

    await act(async () => {
      resolveRemote?.(bundled);
    });

    await waitFor(() => {
      expect(useSearchStore.getState().error).toBeNull();
    });
  });

  test("keeps the init error when the background sync also fails", async () => {
    getLocalDataMock.mockRejectedValue(new AppError(ErrorCode.DataLoadFailed));
    getRemoteDataMock.mockRejectedValue(new AppError(ErrorCode.DataLoadFailed));

    await renderHook(() => useInitData());

    await waitFor(() => {
      expect(getRemoteDataMock).toHaveBeenCalled();
    });
    expect(useSearchStore.getState().error).toBe(ErrorCode.DataLoadFailed);
  });

  test("does not sync again on resume before the interval elapses", async () => {
    await renderHook(() => useInitData());

    await waitFor(() => {
      expect(getRemoteDataMock).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      emitAppState("background");
      emitAppState("active");
    });

    expect(getRemoteDataMock).toHaveBeenCalledTimes(1);
  });

  test("syncs again on resume after the interval elapses", async () => {
    const startedAt = Date.now();
    jest.spyOn(Date, "now").mockImplementation(() => startedAt);

    await renderHook(() => useInitData());

    await waitFor(() => {
      expect(getRemoteDataMock).toHaveBeenCalledTimes(1);
    });

    jest.spyOn(Date, "now").mockImplementation(() => startedAt + SYNC_INTERVAL_MS);

    await act(async () => {
      emitAppState("background");
      emitAppState("active");
    });

    await waitFor(() => {
      expect(getRemoteDataMock).toHaveBeenCalledTimes(2);
    });
  });
});
