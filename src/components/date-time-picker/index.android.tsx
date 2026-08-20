import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useCallback } from "react";

import { DateTimePickerTrigger } from "./date-time-picker-trigger";
import type { DateTimePickerProps } from "./types";
import { useDepartureDateTimePicker } from "./use-departure-date-time-picker";

export type { DateTimePickerProps } from "./types";

export function DateTimePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateTimePickerProps) {
  const { t, displayText, setDepartureNow, setDepartureDateTime } =
    useDepartureDateTimePicker(value, onChange);

  const openPicker = useCallback(() => {
    const currentDate = value.date ?? new Date();

    DateTimePickerAndroid.open({
      value: currentDate,
      mode: "date",
      minimumDate,
      maximumDate,
      title: t("selectTime.pickerTitle"),
      neutralButton: { label: t("selectTime.departureNow") },
      positiveButton: { label: t("selectTime.ok") },
      negativeButton: { label: t("selectTime.cancel") },
      onNeutralButtonPress: setDepartureNow,
      onValueChange: (_event, selectedDate) => {
        if (!selectedDate) {
          return;
        }

        DateTimePickerAndroid.open({
          value: selectedDate,
          mode: "time",
          is24Hour: true,
          positiveButton: { label: t("selectTime.ok") },
          negativeButton: { label: t("selectTime.cancel") },
          onValueChange: (_timeEvent, timeDate) => {
            if (timeDate) {
              setDepartureDateTime(timeDate);
            }
          },
        });
      },
    });
  }, [
    value.date,
    minimumDate,
    maximumDate,
    t,
    setDepartureNow,
    setDepartureDateTime,
  ]);

  return (
    <DateTimePickerTrigger
      label={t("selectTime.pickerTitle")}
      value={displayText}
      onPress={openPicker}
    />
  );
}
