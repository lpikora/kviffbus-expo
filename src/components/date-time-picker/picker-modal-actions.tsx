import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { dateTimePickerStyles as styles } from "./styles";

type PickerModalActionsProps = {
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function PickerModalActions({
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: PickerModalActionsProps) {
  return (
    <View style={styles.modalButtons}>
      <Pressable
        style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
        onPress={onCancel}
      >
        <ThemedText type="default">{cancelLabel}</ThemedText>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
        onPress={onConfirm}
      >
        <ThemedText type="default">{confirmLabel}</ThemedText>
      </Pressable>
    </View>
  );
}
