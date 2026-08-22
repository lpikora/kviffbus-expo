import { View } from "react-native";

import { AppPressable } from "@/components/app-pressable";
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
      <AppPressable
        accessibilityLabel={cancelLabel}
        style={styles.modalButton}
        onPress={onCancel}
      >
        <AppText>{cancelLabel}</AppText>
      </AppPressable>
      <AppPressable
        accessibilityLabel={confirmLabel}
        style={styles.modalButton}
        onPress={onConfirm}
      >
        <AppText>{confirmLabel}</AppText>
      </AppPressable>
    </View>
  );
}
