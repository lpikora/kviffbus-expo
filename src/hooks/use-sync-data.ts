import { SplashScreen } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { toErrorCode } from "@/errors/appError";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";

export const SPLASH_HIDE_TIMEOUT_MS = 4_000;
export const SYNC_INTERVAL_MS = 15 * 60 * 1000;

function whenHydrated(persist: {
  hasHydrated: () => boolean;
  onFinishHydration: (fn: () => void) => void;
}): Promise<void> {
  return new Promise((resolve) => {
    persist.onFinishHydration(resolve);
    if (persist.hasHydrated()) {
      resolve();
    }
  });
}

export const useInitData = () => {
  const [isReady, setIsReady] = useState(false);
  const initData = useDataStore((state) => state.initData);
  const syncWithApi = useDataStore((state) => state.syncWithApi);
  const lastSyncAttemptAtRef = useRef(0);
  const syncInFlightRef = useRef(false);

  const requestSync = () => {
    if (syncInFlightRef.current) {
      return;
    }
    if (
      lastSyncAttemptAtRef.current !== 0 &&
      Date.now() - lastSyncAttemptAtRef.current < SYNC_INTERVAL_MS
    ) {
      return;
    }

    lastSyncAttemptAtRef.current = Date.now();
    syncInFlightRef.current = true;
    void syncWithApi().finally(() => {
      syncInFlightRef.current = false;
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      SplashScreen.hide();
    }, SPLASH_HIDE_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        await Promise.all([
          whenHydrated(useDataStore.persist),
          whenHydrated(useSearchStore.persist),
        ]);
        if (cancelled) {
          return;
        }
        useSearchStore.getState().setError(null);
        await initData();
      } catch (error) {
        useSearchStore.getState().setError(toErrorCode(error));
        console.warn("Init data failed", error);
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [initData]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    SplashScreen.hide();
    requestSync();
  }, [isReady, requestSync]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        requestSync();
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isReady, requestSync]);
};
