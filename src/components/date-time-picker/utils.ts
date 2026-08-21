export function formatDepartureDate(date: Date, locale: string) {
  return date.toLocaleString(locale, {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
