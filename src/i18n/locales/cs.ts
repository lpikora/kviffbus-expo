import { ErrorTranslationKey } from "@/types/appError";

export default {
  HomeScreen: {
    title: "KVIFF Bus - Spojení",
    connections: "Spojení",
    info: {
      line1:
        "Jízdní řády pro {{edition}}. MFF Karlovy Vary {{year}} jsou aktuální.",
    },
    about: "O aplikaci",
  },
  StopTextInput: {
    from: "Odkud",
    to: "Kam",
    selectStop: "Vyberte zastávku",
  },
  SearchButton: {
    search: "Hledat",
  },
  selectTime: {
    pickerTitle: "Datum a čas odjezdu",
    ok: "OK",
    cancel: "ZRUŠIT",
    departureNow: "Odjezd nyní",
    departureOn: "Odjezd",
  },
  results: {
    noResults:
      "Nebylo nalezeno žádné spojení. (Aplikace umí hledat pouze přímá spojení.)",
  },
  time: {
    in: "za",
  },
  selectStopFromMapScreen: {
    title: "Mapa zastávek",
    openMap: "Zobrazit mapu zastávek",
    comingSoon:
      "Interaktivní mapa se připravuje. Zatím tu je oficiální plán festivalové dopravy.",
  },
  Drawer: {
    LinkToPdfTimetable: "Jízdní řády v PDF",
    LinkToMapImage: "Podrobná mapa zastávek",
    LinkToOfficialTransport: "Festivalová doprava",
  },
  momentCalendarTranslations: {
    lastDay: "[Včera v] H:mm",
    sameDay: "[Dnes v] H:mm",
    nextDay: "[Zítra v] H:mm",
    lastWeek: "[minulý] dddd [v] H:mm",
    nextWeek: "dddd [v] H:mm",
    sameElse: "L",
  },
  App: {
    AppName: "KVIFF Bus",
    AppVersion: "verze",
    TimetablesVersion: "jízdní řády",
    Contact: "Kontakt",
  },
  InfoBanner: {
    title: "O aplikaci",
    description:
      "Neoficiální aplikace od fanouška festivalu pro snadné vyhledávání spojů festivalových autobusů (linek F1, F2, F3). Ušetři si čas i nohy mezi promítáními a užij si Vary naplno!",
  },
  errors: {
    missingStops: "Vyberte zastávku odkud i kam.",
    dataNotReady: "Jízdní řády se ještě nenačetly. Zkuste to znovu.",
    dataLoadFailed: "Nastala chyba při načítání dat.",
    searchFailed: "Nastala chyba při hledání spojů.",
    unknown: "Něco se pokazilo.",
  } satisfies Record<ErrorTranslationKey, string>,
};
