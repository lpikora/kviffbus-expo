import { router, useLocalSearchParams } from "expo-router";
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StopPickerItem } from "@/components/stop-picker-item";
import { space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";
import { StopDto, TypeOfStopType } from "@/types/stopDto";
import { parseStopField } from "@/utils/parse-stop-field";

const keyExtractor = (item: StopDto) => String(item.id);

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

  const handleSelect = (stop: StopDto) => {
    if (field === "from") {
      setFromStop(stop);
    } else if (field === "to") {
      setToStop(stop);
    }
    router.back();
  };

  const renderItem = ({ item }: ListRenderItemInfo<StopDto>) => (
    <StopPickerItem
      stop={item}
      selected={item.id === selectedStopId}
      onPress={() => handleSelect(item)}
    />
  );

  const screenBg = { backgroundColor: theme.colors.bg };

  return (
    <View style={[styles.container, screenBg]}>
      <FlatList
        data={stops}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingVertical: space[8],
    flexGrow: 1,
  },
});
