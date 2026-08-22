import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/cs";

import i18n from "@/i18n";

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

function setDayjsLocale(language: string) {
  dayjs.locale(language.startsWith("cs") ? "cs" : "en");
}

setDayjsLocale(i18n.language);
i18n.on("languageChanged", setDayjsLocale);

export default dayjs;
