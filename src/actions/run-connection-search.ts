import { toErrorCode } from "@/errors/appError";
import { searchConnections } from "@/services/connection-service";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";

export function runConnectionSearch() {
  const { fromStop, toStop, departureDateTime } = useSearchStore.getState();
  const { connections, stops, stopExceptions, appConfig } =
    useDataStore.getState();

  const fromStopId = fromStop?.id;
  const toStopId = toStop?.id;
  const resultsQuery =
    fromStopId != null && toStopId != null
      ? { fromStopId, toStopId }
      : null;

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

    useSearchStore.setState({ results, resultsQuery });
  } catch (error) {
    useSearchStore.setState({
      results: [],
      resultsQuery,
      error: toErrorCode(error),
    });
    console.warn("Error in runConnectionSearch", error);
  } finally {
    useSearchStore.setState({ isLoading: false });
  }
}
