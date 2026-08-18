import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";

const MOCK_STOPS = [
  "Hlavní nádraží",
  "Náměstí Republiky",
  "Florenc",
  "Anděl",
  "Smíchovské nádraží",
  "Dejvická",
  "Hradčanská",
  "Malostranská",
  "Staroměstská",
  "Muzeum",
];

export default function StopPickerScreen() {
  const { field } = useLocalSearchParams<{ field: "from" | "to" }>();

  function handleSelect(stop: string) {
    // TODO: uložit vybranou zastávku do store / query param
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        {field === "from" ? "Odkud" : "Kam"}
      </ThemedText>

      <ScrollView contentContainerStyle={styles.list}>
        {MOCK_STOPS.map((stop) => (
          <Pressable
            key={stop}
            style={({ pressed }) => [
              styles.stopItem,
              pressed && styles.pressed,
            ]}
            onPress={() => handleSelect(stop)}
          >
            <ThemedView type="backgroundElement" style={styles.stopCard}>
              <ThemedText type="defaultBold">{stop}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
  },
  list: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.two,
    alignItems: "center",
  },
  stopItem: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  stopCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.6,
  },
});
