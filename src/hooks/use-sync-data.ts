import { useEffect } from "react";

import { useRootStore } from "@/stores/rootStore";

export const useInitData = () => {
  const initData = useRootStore((state) => state.initData);
  const syncWithApi = useRootStore((state) => state.syncWithApi);

  useEffect(() => {
    initData();
    syncWithApi();
  }, [initData, syncWithApi]);
};
