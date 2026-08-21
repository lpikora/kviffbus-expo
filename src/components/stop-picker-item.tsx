import { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { StopDto } from "@/types/stopDto";

interface Props {
  stop: StopDto;
  selected: boolean;
  onPress: () => void;
}

export const StopPickerItem = memo(function StopPickerItem({
  stop,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.stopItem, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={stop.name}
    >
      <ThemedView
        type={selected ? "backgroundSelected" : "backgroundElement"}
        style={styles.stopCard}
      >
        <ThemedText type="default">{stop.name}</ThemedText>
      </ThemedView>
    </Pressable>
  );
});

const styles = StyleSheet.create({
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
