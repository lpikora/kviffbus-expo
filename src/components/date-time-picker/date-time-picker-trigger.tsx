import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { AppText } from "@/components/app-text";
import { ClockIcon } from "@/components/icons/clock-icon";

import { dateTimePickerStyles as styles } from "./styles";

type DateTimePickerTriggerProps = {
  value: string;
  onPress: () => void;
};

export function DateTimePickerTrigger({
  value,
  onPress,
}: DateTimePickerTriggerProps) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${t("selectTime.pickerTitle")}, ${value}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <ClockIcon />
      <AppText>{value}</AppText>
    </Pressable>
  );
}
