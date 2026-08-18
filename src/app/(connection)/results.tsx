import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

export default function ResultsScreen() {
  const { from, to } = useLocalSearchParams<{ from: string; to: string }>();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        },
      ]}
    >
      <ThemedView style={styles.inner}>
        <ThemedText type="subtitle">
          {from || "?"} → {to || "?"}
        </ThemedText>

        {/* TODO: seznam spojení */}
        <ThemedText themeColor="textSecondary">
          Zde se zobrazí výsledky vyhledávání.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: Spacing.four,
  },
  inner: {
    flex: 1,
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
});
