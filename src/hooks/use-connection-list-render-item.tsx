import { useCallback } from "react";
import { ListRenderItemInfo } from "react-native";

import { ConnectionListItem } from "@/components/connection-list-item";
import { ConnectionResult } from "@/types/connectionResult";

export function useConnectionListRenderItem(fromName: string, toName: string) {
  return useCallback(
    function renderConnectionListItem(
      info: ListRenderItemInfo<ConnectionResult>,
    ) {
      return (
        <ConnectionListItem
          item={info.item}
          fromName={fromName}
          toName={toName}
        />
      );
    },
    [fromName, toName],
  );
}
