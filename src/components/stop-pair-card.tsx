import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";

import { ArrowUpDownIcon } from "@/components/icons/arrow-up-down-icon";
import { StopField } from "@/components/stop-field";
import { radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSearchStore } from "@/stores/search-store";

export function StopPairCard() {
  const { t } = useTranslation();
  const theme = useTheme();
  const fromStop = useSearchStore((state) => state.fromStop);
  const toStop = useSearchStore((state) => state.toStop);
  const swapStops = useSearchStore((state) => state.swapStops);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.bgSubtle }]}>
      <View style={[styles.cardContent, { backgroundColor: theme.colors.bg }]}>
        <View
          style={[styles.inputsColumn, { backgroundColor: theme.colors.bg }]}
        >
          <StopField field="from" stopName={fromStop?.name} />
          <View style={styles.divider} />
          <StopField field="to" stopName={toStop?.name} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("a11y.swapStops")}
          style={({ pressed }) => [styles.swapButton, pressed && styles.pressed]}
          onPress={swapStops}
        >
          <ArrowUpDownIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputsColumn: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: space[24],
    backgroundColor: "rgba(128,128,128,0.2)",
  },
  swapButton: {
    padding: space[24],
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
