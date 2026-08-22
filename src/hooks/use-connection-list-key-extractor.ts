import { useCallback } from "react";

import { ConnectionResult } from "@/types/connectionResult";

export function useConnectionListKeyExtractor() {
  return useCallback(
    (item: ConnectionResult) =>
      `${item.id}-${item.departureDate.toISOString()}`,
    [],
  );
}
