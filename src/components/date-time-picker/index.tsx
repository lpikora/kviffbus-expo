import RNDateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Alert, Modal, useColorScheme, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

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
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => value.date ?? new Date());

  const { t, displayText, setDepartureNow, setDepartureDateTime } =
    useDepartureDateTimePicker(value, onChange);

  const openPickerModal = () => {
    setPickerDate(value.date ?? new Date());
    setShowPicker(true);
  };

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
      <DateTimePickerTrigger value={displayText} onPress={openPicker} />

      <Modal
        transparent
        animationType="slide"
        visible={showPicker}
        accessibilityViewIsModal
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.bgSubtle },
            ]}
          >
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
          </View>
        </View>
      </Modal>
    </>
  );
}
