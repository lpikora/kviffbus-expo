import { createElement, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, StyleSheet, View } from "react-native";

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

function toInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DateTimePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: DateTimePickerProps) {
  const { t, i18n } = useTranslation();
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

  const openPickerModal = useCallback(() => {
    setPickerDate(value.date ?? new Date());
    setShowPicker(true);
  }, [value.date]);

  const handlePress = () => {
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
      <Pressable
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        onPress={handlePress}
      >
        <ThemedText themeColor="textSecondary" type="small">
          {t("selectTime.pickerTitle")}
        </ThemedText>
        <ThemedText type="default">{displayText}</ThemedText>
      </Pressable>

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
            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setShowPicker(false)}
              >
                <ThemedText type="default">{t("selectTime.cancel")}</ThemedText>
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
