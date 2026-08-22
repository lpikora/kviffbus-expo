import { Pressable } from "react-native";

import { AppText } from "@/components/app-text";

import { dateTimePickerStyles as styles } from "./styles";

type DateTimePickerTriggerProps = {
  label: string;
  value: string;
  onPress: () => void;
};

export function DateTimePickerTrigger({
  label,
  value,
  onPress,
}: DateTimePickerTriggerProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <AppText>{value}</AppText>
    </Pressable>
  );
}
