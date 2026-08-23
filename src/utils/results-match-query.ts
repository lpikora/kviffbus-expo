import { ResultsQuery } from "@/stores/search-store";
import { DepartureDateTimeType } from "@/types/departureDateTimeType";

function sameDepartureDate(left: Date | null, right: Date | null) {
  if (left == null && right == null) {
    return true;
  }
  if (left == null || right == null) {
    return false;
  }
  return left.getTime() === right.getTime();
}

export function resultsMatchQuery(
  fromStopId: number | undefined,
  toStopId: number | undefined,
  departureDateTime: DepartureDateTimeType,
  resultsQuery: ResultsQuery | null,
) {
  return (
    fromStopId != null &&
    toStopId != null &&
    resultsQuery?.fromStopId === fromStopId &&
    resultsQuery?.toStopId === toStopId &&
    resultsQuery.departureType === departureDateTime.type &&
    sameDepartureDate(resultsQuery.departureDate, departureDateTime.date)
  );
}

export function resultsHaveStaleImport(
  resultsQuery: ResultsQuery | null,
  importVersion: string,
) {
  return resultsQuery != null && resultsQuery.importVersion !== importVersion;
}
