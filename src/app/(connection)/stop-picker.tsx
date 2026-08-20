import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";

import { useRootStore } from "@/stores/rootStore";
import { StopDto } from "@/types/stopDto";

export default function StopPickerScreen() {
  const { field } = useLocalSearchParams<{ field: "from" | "to" }>();
  const stops = useRootStore((state) => state.stops);
  const setFromStop = useRootStore((state) => state.setFromStop);
  const setToStop = useRootStore((state) => state.setToStop);

  function handleSelect(stop: StopDto) {
    if (field === "from") {
      setFromStop(stop);
    } else {
      setToStop(stop);
    }
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.heading}>
        {field === "from" ? "Odkud" : "Kam"}
      </ThemedText>

      <ScrollView contentContainerStyle={styles.list}>
        {stops.map((stop) => (
          <Pressable
            key={stop.id}
            style={({ pressed }) => [
              styles.stopItem,
              pressed && styles.pressed,
            ]}
            onPress={() => handleSelect(stop)}
          >
            <ThemedView type="backgroundElement" style={styles.stopCard}>
              <ThemedText type="defaultBold">{stop.name}</ThemedText>
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
