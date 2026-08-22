import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";

import { toErrorCode } from "@/errors/appError";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";

function waitForStoreHydration(persist: {
  hasHydrated: () => boolean;
  onFinishHydration: (fn: () => void) => () => void;
}): Promise<void> {
  return new Promise((resolve) => {
    if (persist.hasHydrated()) {
      resolve();
      return;
    }

    let settled = false;
    let unsub = () => {};

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      unsub();
      resolve();
    };

    unsub = persist.onFinishHydration(finish);

    if (persist.hasHydrated()) {
      finish();
    }
  });
}

function waitForHydration(): Promise<void> {
  return Promise.all([
    waitForStoreHydration(useDataStore.persist),
    waitForStoreHydration(useSearchStore.persist),
  ]).then(() => undefined);
}

export const useInitData = () => {
  const [isReady, setIsReady] = useState(false);
  const initData = useDataStore((state) => state.initData);
  const syncWithApi = useDataStore((state) => state.syncWithApi);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        await waitForHydration();
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
    void syncWithApi();
  }, [isReady, syncWithApi]);
};
