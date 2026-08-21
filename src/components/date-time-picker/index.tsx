import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { Alert, Modal, useColorScheme, View } from "react-native";

import { ThemedView } from "@/components/themed-view";

import { DateTimePickerTrigger } from "./date-time-picker-trigger";
import { PickerModalActions } from "./picker-modal-actions";
import { dateTimePickerStyles as styles } from "./styles";
import type { DateTimePickerProps } from "./types";
import { useDepartureDateTimePicker } from "./use-departure-date-time-picker";

export type { DateTimePickerProps } from "./types";

export function DateTimePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateTimePickerProps) {
  const colorScheme = useColorScheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => value.date ?? new Date());

  const { t, displayText, setDepartureNow, setDepartureDateTime } =
    useDepartureDateTimePicker(value, onChange);

  const openPickerModal = useCallback(() => {
    setPickerDate(value.date ?? new Date());
    setShowPicker(true);
  }, [value.date]);

  const openPicker = useCallback(() => {
    Alert.alert(t("selectTime.pickerTitle"), undefined, [
      { text: t("selectTime.departureNow"), onPress: setDepartureNow },
      { text: t("selectTime.departureOn"), onPress: openPickerModal },
      { text: t("selectTime.cancel"), style: "cancel" },
    ]);
  }, [t, setDepartureNow, openPickerModal]);

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
            <RNDateTimePicker
              value={pickerDate}
              mode="datetime"
              display="spinner"
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant={colorScheme === "dark" ? "dark" : "light"}
              onValueChange={(_event, date) => setPickerDate(date)}
            />
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
