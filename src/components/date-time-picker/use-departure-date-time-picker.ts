import { useTranslation } from "react-i18next";

import {
  DepartureDateTimeType,
  TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";

import { formatDepartureDate } from "./utils";

export function useDepartureDateTimePicker(
  value: DepartureDateTimeType,
  onChange: (value: DepartureDateTimeType) => void,
) {
  const { t, i18n } = useTranslation();

  const displayText =
    value.type === TypeOfDepartureDateTimeType.now
      ? t("selectTime.departureNow")
      : value.date
        ? `${t("selectTime.departureOn")} ${formatDepartureDate(value.date, i18n.language)}`
        : t("selectTime.pickerTitle");

  const setDepartureNow = () => {
    onChange({ type: TypeOfDepartureDateTimeType.now, date: null });
  };

  const setDepartureDateTime = 
    (date: Date) => {
      onChange({ type: TypeOfDepartureDateTimeType.dateTime, date });
    };

  return {
    t,
    displayText,
    setDepartureNow,
    setDepartureDateTime,
  };
}
