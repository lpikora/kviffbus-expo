import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { runConnectionSearch } from "@/actions/run-connection-search";
import { AppPressable } from "@/components/app-pressable";
import { AppText } from "@/components/app-text";
import { ConnectionListItem } from "@/components/connection-list-item";
import { ErrorMessage } from "@/components/error-message";
import { radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";
import { useSearchStore } from "@/stores/search-store";
import { ConnectionResult } from "@/types/connectionResult";
import {
  resultsHaveStaleImport,
  resultsMatchQuery,
} from "@/utils/results-match-query";

function keyExtractor(item: ConnectionResult) {
  return `${item.id}-${item.departureDate.toISOString()}`;
}

export default function ResultsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    results,
    resultsQuery,
    fromStop,
    toStop,
    departureDateTime,
    error,
    isLoading,
  } = useSearchStore(
    useShallow((state) => ({
      results: state.results,
      resultsQuery: state.resultsQuery,
      fromStop: state.fromStop,
      toStop: state.toStop,
      departureDateTime: state.departureDateTime,
      error: state.error,
      isLoading: state.isLoading,
    })),
  );

  const importVersion = useDataStore(
    (state) => state.appConfig?.importVersion ?? "",
  );

  const fromName = fromStop?.name ?? "";
  const toName = toStop?.name ?? "";
  const queryMatches = resultsMatchQuery(
    fromStop?.id,
    toStop?.id,
    departureDateTime,
    resultsQuery,
  );
  const visibleResults = queryMatches ? results : [];

  function renderItem({ item }: ListRenderItemInfo<ConnectionResult>) {
    return (
      <ConnectionListItem item={item} fromName={fromName} toName={toName} />
    );
  }

  const screenBg = { backgroundColor: theme.colors.bg };

  if (isLoading) {
    return (
      <View style={[styles.noConnectionsContainer, screenBg]}>
        <ActivityIndicator color={theme.colors.fg} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.noConnectionsContainer, screenBg]}>
        <ErrorMessage code={error} />
      </View>
    );
  }

  if (resultsHaveStaleImport(resultsQuery, importVersion) && queryMatches) {
    return (
      <View style={[styles.noConnectionsContainer, screenBg]}>
        <AppText>{t("results.timetableUpdated")}</AppText>
        <AppPressable
          accessibilityLabel={t("results.refresh")}
          style={[
            styles.refreshButton,
            { backgroundColor: theme.colors.accent },
          ]}
          onPress={() => {
            runConnectionSearch();
          }}
        >
          <AppText variant="bodyBold" style={{ color: theme.colors.onAccent }}>
            {t("results.refresh")}
          </AppText>
        </AppPressable>
      </View>
    );
  }

  if (visibleResults.length > 0) {
    return (
      <View style={[styles.container, screenBg]}>
        <FlatList
          data={visibleResults}
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

  return (
    <View style={[styles.noConnectionsContainer, screenBg]}>
      <AppText>{t("results.noResults")}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  noConnectionsContainer: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: space[24],
    alignItems: "center",
    gap: space[16],
  },
  refreshButton: {
    paddingVertical: space[16],
    paddingHorizontal: space[24],
    borderRadius: radius.lg,
    alignItems: "center",
  },
});
