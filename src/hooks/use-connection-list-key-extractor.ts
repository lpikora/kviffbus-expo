import { useCallback } from "react";

import { ConnectionDto } from "@/types/connectionDto";

export function useConnectionListKeyExtractor() {
  return useCallback(
    (item: ConnectionDto) =>
      `${item.id}-${item.departureDate?.toISOString() ?? "unknown"}`,
    [],
  );
}
