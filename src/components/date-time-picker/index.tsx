import RNDateTimePicker, {
    DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Alert,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    useColorScheme,
    View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import {
    DepartureDateTimeType,
    TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";

export type DateTimePickerProps = {
  value: DepartureDateTimeType;
  onChange: (value: DepartureDateTimeType) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

function formatDepartureDate(date: Date, locale: string) {
  return date.toLocaleString(locale, {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DateTimePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateTimePickerProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => value.date ?? new Date());

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

  const openAndroidPicker = useCallback(() => {
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

  const openPickerModal = useCallback(() => {
    setPickerDate(value.date ?? new Date());
    setShowPicker(true);
  }, [value.date]);

  const openIOSPicker = useCallback(() => {
    Alert.alert(t("selectTime.pickerTitle"), undefined, [
      { text: t("selectTime.departureNow"), onPress: setDepartureNow },
      { text: t("selectTime.departureOn"), onPress: openPickerModal },
      { text: t("selectTime.cancel"), style: "cancel" },
    ]);
  }, [t, setDepartureNow, openPickerModal]);

  const handlePress =
    Platform.OS === "android" ? openAndroidPicker : openIOSPicker;

  const confirmPicker = () => {
    setDepartureDateTime(pickerDate);
    setShowPicker(false);
  };

  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={handlePress}
      >
        <ThemedText themeColor="textSecondary" type="small">
          {t("selectTime.pickerTitle")}
        </ThemedText>
        <ThemedText type="default">{displayText}</ThemedText>
      </Pressable>

      {Platform.OS === "ios" && showPicker ? (
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
              <View style={styles.modalButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setShowPicker(false)}
                >
                  <ThemedText type="default">
                    {t("selectTime.cancel")}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={confirmPicker}
                >
                  <ThemedText type="default">{t("selectTime.ok")}</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingBottom: Spacing.four,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  modalButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
