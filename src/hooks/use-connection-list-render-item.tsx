import { useCallback } from "react";
import { ListRenderItemInfo } from "react-native";

import { ConnectionListItem } from "@/components/connection-list-item";
import { ConnectionDto } from "@/types/connectionDto";

export function useConnectionListRenderItem(fromName: string, toName: string) {
  return useCallback(
    function renderConnectionListItem(
      info: ListRenderItemInfo<ConnectionDto>,
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
