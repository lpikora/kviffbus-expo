import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { runConnectionSearch } from "@/actions/run-connection-search";
import { AppText } from "@/components/app-text";
import { DateTimePicker } from "@/components/date-time-picker/index";
import { ErrorMessage } from "@/components/error-message";
import { StopPairCard } from "@/components/stop-pair-card";
import { BottomTabInset, MaxContentWidth, radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useSearchStore } from "@/stores/search-store";
import { ErrorCode } from "@/types/appError";

export default function ConnectionScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const fromStop = useSearchStore((state) => state.fromStop);
  const toStop = useSearchStore((state) => state.toStop);
  const departureDateTime = useSearchStore((state) => state.departureDateTime);
  const setDepartureDateTime = useSearchStore(
    (state) => state.setDepartureDateTime,
  );
  const setError = useSearchStore((state) => state.setError);
  const error = useSearchStore((state) => state.error);

  const handleSearch = () => {
    if (!fromStop || !toStop) {
      setError(ErrorCode.MissingStops);
      return;
    }
    runConnectionSearch();
    router.navigate("/results");
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <SafeAreaView style={styles.safeArea}>
        {error ? <ErrorMessage code={error} /> : null}

        <StopPairCard />

        <View style={[styles.card, { backgroundColor: theme.colors.bgSubtle }]}>
          <DateTimePicker
            value={departureDateTime}
            onChange={setDepartureDateTime}
            minimumDate={new Date()}
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            { backgroundColor: theme.colors.accent },
            pressed && styles.pressed,
          ]}
          onPress={handleSearch}
        >
          <AppText
            variant="bodyBold"
            style={{ color: theme.colors.onAccent }}
          >
            {t("SearchButton.search")}
          </AppText>
        </Pressable>
      </SafeAreaView>
    </View>
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
    paddingTop: space[16],
    paddingHorizontal: space[24],
    gap: space[16],
    paddingBottom: BottomTabInset + space[16],
    maxWidth: MaxContentWidth,
    justifyContent: "flex-start",
  },
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.6,
  },
  searchButton: {
    marginTop: space[8],
    paddingVertical: space[16],
    borderRadius: radius.lg,
    alignItems: "center",
  },
});
