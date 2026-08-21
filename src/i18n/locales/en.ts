import { ErrorTranslationKey } from "@/types/appError";

export default {
  HomeScreen: {
    title: "KVIFF Bus - Connections",
    connections: "Connections",
    info: {
      line1: "Timetables for the {{edition}} KVIFF {{year}} are up to date.",
    },
    about: "About App",
  },
  StopTextInput: {
    from: "From",
    to: "To",
    selectStop: "Select a stop",
  },
  SearchButton: {
    search: "Search",
  },
  selectTime: {
    pickerTitle: "Departure Time",
    ok: "OK",
    cancel: "CANCEL",
    departureNow: "Departure now",
    departureOn: "Departure on",
  },
  results: {
    noResults:
      "No connections found. (Application can find only direct connections.)",
  },
  time: {
    in: "in",
  },
  selectStopFromMapScreen: {
    title: "Stop map",
    openMap: "View stop map",
    comingSoon:
      "The interactive map is coming soon. For now, here is the official festival transport plan.",
  },
  Drawer: {
    LinkToPdfTimetable: "Timetable in PDF",
    LinkToMapImage: "Detailed bus stop map",
    LinkToOfficialTransport: "Festival transport",
  },
  momentCalendarTranslations: {
    lastDay: "[Yesterday at] H:mm",
    sameDay: "[Today at] H:mm",
    nextDay: "[Tomorrow at] H:mm",
    lastWeek: "[last] dddd [at] H:mm",
    nextWeek: "dddd [at] H:mm",
    sameElse: "L",
  },
  App: {
    AppName: "KVIFF Bus",
    AppVersion: "version",
    TimetablesVersion: "timetables",
    Contact: "Contact",
  },
  InfoBanner: {
    title: "About the App",
    description:
      "An unofficial app by a festival fan for easy connection searches on the festival bus lines (F1, F2, F3). Save your time and feet between screenings and enjoy Vary to the fullest!",
  },
  errors: {
    missingStops: "Please select both a from and a to stop.",
    dataNotReady: "Timetables have not loaded yet. Please try again.",
    searchFailed: "Failed to search for connections.",
    dataLoadFailed: "Failed to load data.",
    unknown: "Something went wrong.",
  } satisfies Record<ErrorTranslationKey, string>,
};
