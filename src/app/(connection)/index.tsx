import { router } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DateTimePicker } from "@/components/date-time-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useRootStore } from "@/stores/rootStore";
import { SymbolView } from "expo-symbols";
import { useTranslation } from "react-i18next";

export default function ConnectionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const fromStop = useRootStore((state) => state.fromStop);
  const toStop = useRootStore((state) => state.toStop);
  const departureDateTime = useRootStore((state) => state.departureDateTime);
  const setDepartureDateTime = useRootStore(
    (state) => state.setDepartureDateTime,
  );
  const searchConnections = useRootStore((state) => state.searchConnections);
  const swapStops = useRootStore((state) => state.swapStops);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          {t("HomeScreen.title")}
        </ThemedText>

        {/* Stop selectors */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedView style={styles.cardContent}>
            <ThemedView style={styles.inputsColumn}>
              <Pressable
                style={({ pressed }) => [
                  styles.stopRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push("/stop-picker?field=from")}
              >
                <ThemedText themeColor="textSecondary" type="small">
                  {t("StopTextInput.from")}
                </ThemedText>
                <ThemedText type="defaultBold">
                  {fromStop ? fromStop.name : t("StopTextInput.selectStop")}
                </ThemedText>
              </Pressable>

              <ThemedView style={styles.divider} />

              <Pressable
                style={({ pressed }) => [
                  styles.stopRow,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push("/stop-picker?field=to")}
              >
                <ThemedText themeColor="textSecondary" type="small">
                  {t("StopTextInput.to")}
                </ThemedText>
                <ThemedText type="defaultBold">
                  {toStop ? toStop.name : t("StopTextInput.selectStop")}
                </ThemedText>
              </Pressable>
            </ThemedView>

            <Pressable
              style={({ pressed }) => [
                styles.swapButton,
                pressed && styles.pressed,
              ]}
              onPress={swapStops}
            >
              <SymbolView
                tintColor={theme.text}
                name={{
                  ios: "arrow.up.arrow.down",
                  android: "swap_vert",
                  web: "swap_vert",
                }}
                size={24}
              />
            </Pressable>
          </ThemedView>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.card}>
          <DateTimePicker
            value={departureDateTime}
            onChange={setDepartureDateTime}
            minimumDate={new Date()}
          />
        </ThemedView>

        {/* Search button */}
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            router.push({
              pathname: "/results",
              params: {
                from: fromStop?.id.toString() ?? "",
                to: toStop?.id.toString() ?? "",
              },
            });
            searchConnections();
          }}
        >
          <ThemedText
            style={styles.searchButtonText}
            type={Platform.OS === "web" ? "defaultBold" : "defaultBold"}
          >
            {t("SearchButton.search")}
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
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
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
    justifyContent: "center",
  },
  title: {
    marginBottom: Spacing.two,
  },
  card: {
    borderRadius: Spacing.four,
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
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.four,
    backgroundColor: "rgba(128,128,128,0.2)",
  },
  swapButton: {
    padding: Spacing.four,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.6,
  },
  mapButton: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.one,
  },
  searchButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  searchButtonText: {
    color: "#fff",
  },
});
