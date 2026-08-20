import { createElement, useCallback, useState } from "react";
import { Alert, Modal, View } from "react-native";

import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";

import { DateTimePickerTrigger } from "./date-time-picker-trigger";
import { PickerModalActions } from "./picker-modal-actions";
import { dateTimePickerStyles as styles } from "./styles";
import type { DateTimePickerProps } from "./types";
import { useDepartureDateTimePicker } from "./use-departure-date-time-picker";
import { toInputValue } from "./utils";

export type { DateTimePickerProps } from "./types";

export function DateTimePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateTimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => value.date ?? new Date());

  const { t, displayText, setDepartureNow, setDepartureDateTime } =
    useDepartureDateTimePicker(value, onChange);

  const openPickerModal = useCallback(() => {
    setPickerDate(value.date ?? new Date());
    setShowPicker(true);
  }, [value.date]);

  const openPicker = () => {
    Alert.alert(t("selectTime.pickerTitle"), undefined, [
      { text: t("selectTime.departureNow"), onPress: setDepartureNow },
      { text: t("selectTime.departureOn"), onPress: openPickerModal },
      { text: t("selectTime.cancel"), style: "cancel" },
    ]);
  };

  const confirmPicker = () => {
    setDepartureDateTime(pickerDate);
    setShowPicker(false);
  };

  return (
    <>
      <DateTimePickerTrigger
        label={t("selectTime.pickerTitle")}
        value={displayText}
        onPress={openPicker}
      />

      <Modal transparent animationType="slide" visible={showPicker}>
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={styles.modalContent}>
            {createElement("input", {
              type: "datetime-local",
              value: toInputValue(pickerDate),
              min: minimumDate ? toInputValue(minimumDate) : undefined,
              max: maximumDate ? toInputValue(maximumDate) : undefined,
              onChange: (event: Event & { target: HTMLInputElement }) => {
                const nextDate = new Date(event.target.value);

                if (!Number.isNaN(nextDate.getTime())) {
                  setPickerDate(nextDate);
                }
              },
              style: {
                width: "100%",
                fontSize: 16,
                padding: Spacing.three,
                border: "none",
                background: "transparent",
              },
            })}
            <PickerModalActions
              cancelLabel={t("selectTime.cancel")}
              confirmLabel={t("selectTime.ok")}
              onCancel={() => setShowPicker(false)}
              onConfirm={confirmPicker}
            />
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}
