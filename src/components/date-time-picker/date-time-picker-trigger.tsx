import { useTranslation } from "react-i18next";
import { AppPressable } from "@/components/app-pressable";
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
    <AppPressable
      accessibilityLabel={`${t("selectTime.pickerTitle")}, ${value}`}
      style={styles.row}
      onPress={onPress}
    >
      <ClockIcon />
      <AppText>{value}</AppText>
    </AppPressable>
  );
}
