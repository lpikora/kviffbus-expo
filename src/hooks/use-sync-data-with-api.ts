import { useEffect } from "react";

import { useRootStore } from "@/stores/rootStore";

export const useSyncDataWithApi = () => {
  const syncWithApi = useRootStore((state) => state.syncWithApi);

  useEffect(() => {
    syncWithApi();
  }, [syncWithApi]);
};
