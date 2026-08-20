import { useCallback } from "react";
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

  const setDepartureNow = useCallback(() => {
    onChange({ type: TypeOfDepartureDateTimeType.now, date: null });
  }, [onChange]);

  const setDepartureDateTime = useCallback(
    (date: Date) => {
      onChange({ type: TypeOfDepartureDateTimeType.dateTime, date });
    },
    [onChange],
  );

  return {
    t,
    displayText,
    setDepartureNow,
    setDepartureDateTime,
  };
}
