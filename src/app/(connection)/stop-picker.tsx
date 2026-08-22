import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { StopPickerItem } from "@/components/stop-picker-item";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";
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
  const { t } = useTranslation();
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
      <Pressable
        style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}
        onPress={() => router.navigate("/map")}
        accessibilityRole="button"
        accessibilityLabel={t("selectStopFromMapScreen.openMap")}
      >
        <ThemedView type="backgroundElement" style={styles.mapButtonInner}>
          <ThemedText type="linkPrimary">
            {t("selectStopFromMapScreen.openMap")}
          </ThemedText>
        </ThemedView>
      </Pressable>
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
  mapButton: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  mapButtonInner: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  pressed: {
    opacity: 0.6,
  },
});
