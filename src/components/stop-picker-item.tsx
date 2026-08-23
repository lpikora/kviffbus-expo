import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { AppPressable } from "@/components/app-pressable";
import { AppText } from "@/components/app-text";
import { MaxContentWidth, radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
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
  const theme = useTheme();

  return (
    <AppPressable
      style={styles.stopItem}
      onPress={onPress}
      accessibilityState={{ selected }}
      accessibilityLabel={stop.name}
    >
      <View
        style={[
          styles.stopCard,
          {
            backgroundColor: selected
              ? theme.colors.bgSelected
              : theme.colors.bgSubtle,
          },
        ]}
      >
        <AppText>{stop.name}</AppText>
      </View>
    </AppPressable>
  );
});

const styles = StyleSheet.create({
  stopItem: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  stopCard: {
    padding: space[16],
    borderRadius: radius.md,
  },
});
