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
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <ClockIcon />
      <AppText>{value}</AppText>
    </Pressable>
  );
}
