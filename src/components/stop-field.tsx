import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import { AppPressable } from "@/components/app-pressable";
import { AppText } from "@/components/app-text";
import { space } from "@/constants/theme";
import { TypeOfStopType } from "@/types/stopDto";

interface Props {
  field: TypeOfStopType;
  stopName?: string;
}

export function StopField({ field, stopName }: Props) {
  const { t } = useTranslation();
  const fieldLabel =
    field === "from" ? t("StopTextInput.from") : t("StopTextInput.to");
  const valueLabel = stopName ?? t("StopTextInput.selectStop");

  return (
    <AppPressable
      accessibilityLabel={`${fieldLabel}, ${valueLabel}`}
      style={styles.stopRow}
      onPress={() => router.navigate(`/stop-picker?field=${field}`)}
    >
      <AppText variant="caption" tone="muted">
        {fieldLabel}
      </AppText>
      <AppText variant="bodyBold">
        {stopName ?? t("StopTextInput.selectStop")}
      </AppText>
    </AppPressable>
  );
}

const styles = StyleSheet.create({
  stopRow: {
    paddingHorizontal: space[24],
    paddingVertical: space[16],
    gap: space[4],
  },
});
