
import { getDateTimeStringFromNowToDate } from "@/utils/format-time";

export function useTimeToDepartureLabel(departureDate: Date, now: Date) {
  return getDateTimeStringFromNowToDate(now, departureDate);
}
