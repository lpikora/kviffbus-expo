import { toErrorCode } from "@/errors/appError";
import { searchConnections } from "@/services/connection-service";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";

export function runConnectionSearch() {
  const { fromStop, toStop, departureDateTime } = useSearchStore.getState();
  const { connections, stops, stopExceptions, appConfig } =
    useDataStore.getState();

  useSearchStore.setState({ isLoading: true, error: null });
  try {
    const results = searchConnections(
      connections,
      stops,
      stopExceptions,
      appConfig,
      {
        fromStop,
        toStop,
        departureDateTime,
      },
    );

    useSearchStore.setState({ results });
  } catch (error) {
    useSearchStore.setState({ results: [], error: toErrorCode(error) });
    console.warn("Error in runConnectionSearch", error);
  } finally {
    useSearchStore.setState({ isLoading: false });
  }
}
