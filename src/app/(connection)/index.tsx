import { router } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

export default function ConnectionScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Vyhledat spoj
        </ThemedText>

        {/* Stop selectors */}
        <ThemedView type="backgroundElement" style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.stopRow, pressed && styles.pressed]}
            onPress={() => router.push("/stop-picker?field=from")}
          >
            <ThemedText themeColor="textSecondary" type="small">
              Odkud
            </ThemedText>
            <ThemedText type="defaultBold">Vybrat zastávku…</ThemedText>
          </Pressable>

          <ThemedView style={styles.divider} />

          <Pressable
            style={({ pressed }) => [styles.stopRow, pressed && styles.pressed]}
            onPress={() => router.push("/stop-picker?field=to")}
          >
            <ThemedText themeColor="textSecondary" type="small">
              Kam
            </ThemedText>
            <ThemedText type="defaultBold">Vybrat zastávku…</ThemedText>
          </Pressable>
        </ThemedView>

        {/* Map shortcut */}
        <Pressable
          style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}
          onPress={() => router.push("/map")}
        >
          <ThemedText type="link">Zobrazit mapu</ThemedText>
        </Pressable>

        {/* Search button */}
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.push({
              pathname: "/results",
              params: { from: "", to: "" },
            })
          }
        >
          <ThemedText
            style={styles.searchButtonText}
            type={Platform.OS === "web" ? "defaultBold" : "defaultBold"}
          >
            Hledat spoj
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
