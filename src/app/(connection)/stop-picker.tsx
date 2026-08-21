import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StopPickerItem } from "@/components/stop-picker-item";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useRootStore } from "@/stores/rootStore";
import { StopDto, TypeOfStopType } from "@/types/stopDto";

function parseField(
  value: string | string[] | undefined,
): TypeOfStopType | undefined {
  const field = Array.isArray(value) ? value[0] : value;
  if (field === "from" || field === "to") {
    return field;
  }
  return undefined;
}

export default function StopPickerScreen() {
  const { field: fieldParam } = useLocalSearchParams<{
    field?: TypeOfStopType;
  }>();
  const field = parseField(fieldParam);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const stops = useRootStore((state) => state.stops);

  const selectedStopId = useRootStore((state) => {
    if (field === "from") {
      return state.fromStop?.id;
    }
    if (field === "to") {
      return state.toStop?.id;
    }
    return undefined;
  });
  const setFromStop = useRootStore((state) => state.setFromStop);
  const setToStop = useRootStore((state) => state.setToStop);

  const handleSelect = useCallback(
    (stop: StopDto) => {
      if (field === "from") {
        setFromStop(stop);
      } else if (field === "to") {
        setToStop(stop);
      }
      router.back();
    },
    [field, setFromStop, setToStop],
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentInset={{ bottom: insets.bottom }}
      contentContainerStyle={[
        styles.list,
        {
          paddingTop: Spacing.two,
          paddingBottom: insets.bottom + Spacing.six,
        },
      ]}
    >
      {stops.map((stop) => (
        <StopPickerItem
          key={stop.id}
          stop={stop}
          selected={stop.id === selectedStopId}
          onPress={() => handleSelect(stop)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    alignItems: "center",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
  },
});
