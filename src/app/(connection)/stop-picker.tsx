import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StopPickerItem } from "@/components/stop-picker-item";
import { MaxContentWidth, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";
import { StopDto, TypeOfStopType } from "@/types/stopDto";
import { parseStopField } from "@/utils/parse-stop-field";

export default function StopPickerScreen() {
  const { field: fieldParam } = useLocalSearchParams<{
    field?: TypeOfStopType;
  }>();
  const field = parseStopField(fieldParam);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const stops = useDataStore((state) => state.stops);

  const selectedStopId = useSearchStore((state) => {
    if (field === "from") {
      return state.fromStop?.id;
    }
    if (field === "to") {
      return state.toStop?.id;
    }
    return undefined;
  });
  const setFromStop = useSearchStore((state) => state.setFromStop);
  const setToStop = useSearchStore((state) => state.setToStop);

  const handleSelect = 
    (stop: StopDto) => {
      if (field === "from") {
        setFromStop(stop);
      } else if (field === "to") {
        setToStop(stop);
      }
      router.back();
    }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.bg }]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      contentInset={{ bottom: insets.bottom }}
      contentContainerStyle={[
        styles.list,
        {
          paddingTop: space[8],
          paddingBottom: insets.bottom + space[64],
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
    paddingHorizontal: space[24],
    gap: space[8],
    alignItems: "center",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
  },
});
