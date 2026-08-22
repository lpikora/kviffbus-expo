import { Pressable, View } from "react-native";

import { AppText } from "@/components/app-text";

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
        <AppText>{cancelLabel}</AppText>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
        onPress={onConfirm}
      >
        <AppText>{confirmLabel}</AppText>
      </Pressable>
    </View>
  );
}
