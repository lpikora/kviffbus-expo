import { SplashScreen } from "expo-router";
import { useEffect, useState } from "react";

import { useRootStore } from "@/stores/rootStore";

const HYDRATION_TIMEOUT_MS = 3000;

function waitForHydration(): Promise<void> {
  const persist = useRootStore.persist;

  return new Promise((resolve) => {
    if (persist.hasHydrated()) {
      resolve();
      return;
    }

    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsub = () => {};

    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      unsub();
      resolve();
    };

    unsub = persist.onFinishHydration(finish);

    timeoutId = setTimeout(() => {
      console.warn("Store hydration timed out");
      finish();
    }, HYDRATION_TIMEOUT_MS);

    if (persist.hasHydrated()) {
      finish();
    }
  });
}

export const useInitData = () => {
  const [isReady, setIsReady] = useState(false);
  const initData = useRootStore((state) => state.initData);
  const syncWithApi = useRootStore((state) => state.syncWithApi);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        await waitForHydration();
        if (cancelled) {
          return;
        }
        await initData();
      } catch (error) {
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
