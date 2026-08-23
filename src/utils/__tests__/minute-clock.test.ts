import { act, renderHook } from "@testing-library/react-native";
import {
  AppState,
  type AppStateStatus,
  type NativeEventSubscription,
} from "react-native";

import { useMinuteNow } from "@/utils/minute-clock";

const appStateListeners: ((state: AppStateStatus) => void)[] = [];

function emitAppState(state: AppStateStatus) {
  for (const listener of appStateListeners) {
    listener(state);
  }
}

describe("useMinuteNow", () => {
  beforeEach(() => {
    appStateListeners.length = 0;
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-21T10:00:00"));
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_event, handler) => {
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
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("advances now every minute", async () => {
    const { result } = await renderHook(() => useMinuteNow());

    expect(result.current.getTime()).toBe(
      new Date("2026-08-21T10:00:00").getTime(),
    );

    await act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(result.current.getTime()).toBe(
      new Date("2026-08-21T10:01:00").getTime(),
    );
  });

  test("refreshes now when the app becomes active", async () => {
    const { result } = await renderHook(() => useMinuteNow());

    jest.setSystemTime(new Date("2026-08-21T10:00:30"));

    await act(() => {
      emitAppState("active");
    });

    expect(result.current.getTime()).toBe(
      new Date("2026-08-21T10:00:30").getTime(),
    );
  });

  test("does not refresh now when the app is backgrounded", async () => {
    const { result } = await renderHook(() => useMinuteNow());

    jest.setSystemTime(new Date("2026-08-21T10:00:30"));

    await act(() => {
      emitAppState("background");
    });

    expect(result.current.getTime()).toBe(
      new Date("2026-08-21T10:00:00").getTime(),
    );
  });

  test("removes the AppState listener on unmount", async () => {
    const { unmount } = await renderHook(() => useMinuteNow());

    expect(appStateListeners).toHaveLength(1);

    await act(() => {
      unmount();
    });

    expect(appStateListeners).toHaveLength(0);
  });
});
