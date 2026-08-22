import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { runConnectionSearch } from "@/actions/run-connection-search";
import { AppText } from "@/components/app-text";
import { DateTimePicker } from "@/components/date-time-picker/index";
import { ErrorMessage } from "@/components/error-message";
import { BottomTabInset, MaxContentWidth, radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSearchStore } from "@/stores/search-store";
import { ErrorCode } from "@/types/appError";

export default function ConnectionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const fromStop = useSearchStore((state) => state.fromStop);
  const toStop = useSearchStore((state) => state.toStop);
  const departureDateTime = useSearchStore((state) => state.departureDateTime);
  const setDepartureDateTime = useSearchStore(
    (state) => state.setDepartureDateTime,
  );
  const setError = useSearchStore((state) => state.setError);
  const swapStops = useSearchStore((state) => state.swapStops);
  const error = useSearchStore((state) => state.error);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <SafeAreaView style={styles.safeArea}>
        {error ? <ErrorMessage code={error} /> : null}

        <View
          style={[styles.card, { backgroundColor: theme.colors.bgSubtle }]}
        >
          <View
            style={[styles.cardContent, { backgroundColor: theme.colors.bg }]}
          >
            <View
              style={[
                styles.inputsColumn,
                { backgroundColor: theme.colors.bg },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.stopRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.navigate("/stop-picker?field=from")}
              >
                <AppText variant="caption" tone="muted">
                  {t("StopTextInput.from")}
                </AppText>
                <AppText variant="bodyBold">
                  {fromStop ? fromStop.name : t("StopTextInput.selectStop")}
                </AppText>
              </Pressable>

              <View style={styles.divider} />

              <Pressable
                style={({ pressed }) => [
                  styles.stopRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.navigate("/stop-picker?field=to")}
              >
                <AppText variant="caption" tone="muted">
                  {t("StopTextInput.to")}
                </AppText>
                <AppText variant="bodyBold">
                  {toStop ? toStop.name : t("StopTextInput.selectStop")}
                </AppText>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.swapButton,
                pressed && styles.pressed,
              ]}
              onPress={swapStops}
            >
              <SymbolView
                tintColor={theme.colors.fg}
                name={{
                  ios: "arrow.up.arrow.down",
                  android: "swap_vert",
                }}
                size={24}
              />
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.bgSubtle }]}>
          <DateTimePicker
            value={departureDateTime}
            onChange={setDepartureDateTime}
            minimumDate={new Date()}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            if (!fromStop || !toStop) {
              setError(ErrorCode.MissingStops);
              return;
            }
            runConnectionSearch();
            router.navigate("/results");
          }}
        >
          <AppText variant="bodyBold" style={styles.searchButtonText}>
            {t("SearchButton.search")}
          </AppText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingTop: space[16],
    paddingHorizontal: space[24],
    gap: space[16],
    paddingBottom: BottomTabInset + space[16],
    maxWidth: MaxContentWidth,
    justifyContent: "flex-start",
  },
  title: {
    marginBottom: space[8],
  },
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
  stopRow: {
    paddingHorizontal: space[24],
    paddingVertical: space[16],
    gap: space[4],
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
  searchButton: {
    marginTop: space[8],
    paddingVertical: space[16],
    borderRadius: radius.lg,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
  },
});
