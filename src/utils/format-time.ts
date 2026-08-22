import i18n from "@/i18n";
import dayjs from "@/utils/dayjs";

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMinutesToHhMm(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

export function getDateTimeStringFromNowToDate(date: Date) {
  const nowDate = new Date();
  const seconds = (date.getTime() - nowDate.getTime()) / 1000;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (toDateKey(nowDate) !== toDateKey(date)) {
    return dayjs(date).calendar(undefined, {
      lastDay: i18n.t("calendarTranslations.lastDay"),
      sameDay: i18n.t("calendarTranslations.sameDay"),
      nextDay: i18n.t("calendarTranslations.nextDay"),
      lastWeek: i18n.t("calendarTranslations.lastWeek"),
      nextWeek: i18n.t("calendarTranslations.nextWeek"),
      sameElse: i18n.t("calendarTranslations.sameElse"),
    });
  }

  if (h <= 0) {
    return dayjs().to(date);
  }

  return `${i18n.t("time.in")} ${h} h ${m} min`;
}

export function getDurationBetweenTwoTimes(
  departureMinutes: number,
  arrivalMinutes: number,
) {
  let duration = arrivalMinutes - departureMinutes;
  if (duration < 0) {
    duration += 1440;
  }

  return duration + " min";
}
