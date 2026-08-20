import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";

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
      <ThemedText themeColor="textSecondary" type="small">
        {label}
      </ThemedText>
      <ThemedText type="default">{value}</ThemedText>
    </Pressable>
  );
}
