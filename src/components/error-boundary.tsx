import { type ErrorBoundaryProps } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppPressable } from "@/components/app-pressable";
import { AppText } from "@/components/app-text";
import { ErrorMessage } from "@/components/error-message";
import { space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { ErrorCode } from "@/types/appError";

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    console.warn("ErrorBoundary", error);
  }, [error]);

  return (
    <View style={[styles.fallback, { backgroundColor: theme.colors.bg }]}>
      <ErrorMessage code={ErrorCode.Unknown} />
      <AppPressable
        accessibilityLabel={t("ErrorBoundary.retry")}
        onPress={() => {
          void retry();
        }}
        style={styles.retry}
      >
        <AppText tone="accent">{t("ErrorBoundary.retry")}</AppText>
      </AppPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: space[16],
    paddingHorizontal: space[24],
  },
  retry: {
    paddingVertical: space[8],
    paddingHorizontal: space[16],
  },
});
