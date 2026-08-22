import { ResultsQuery } from "@/stores/search-store";

export function resultsMatchQuery(
  fromStopId: number | undefined,
  toStopId: number | undefined,
  resultsQuery: ResultsQuery | null,
) {
  return (
    fromStopId != null &&
    toStopId != null &&
    resultsQuery?.fromStopId === fromStopId &&
    resultsQuery?.toStopId === toStopId
  );
}
