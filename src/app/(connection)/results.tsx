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

import { AppText } from "@/components/app-text";
import { ConnectionListItem } from "@/components/connection-list-item";
import { ErrorMessage } from "@/components/error-message";
import { useTheme } from "@/hooks/use-theme";
import { ResultsQuery, useSearchStore } from "@/stores/search-store";
import { ConnectionResult } from "@/types/connectionResult";

function keyExtractor(item: ConnectionResult) {
  return `${item.id}-${item.departureDate.toISOString()}`;
}

function resultsMatchQuery(
  fromStopId: number | undefined,
  toStopId: number | undefined,
  resultsQuery: ResultsQuery | null,
) {
  return (
    fromStopId != null &&
    toStopId != null &&
    resultsQuery?.fromStopId === fromStopId &&
    resultsQuery?.toStopId === toStopId
  );
}

export default function ResultsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { results, resultsQuery, fromStop, toStop, error, isLoading } =
    useSearchStore(
      useShallow((state) => ({
        results: state.results,
        resultsQuery: state.resultsQuery,
        fromStop: state.fromStop,
        toStop: state.toStop,
        error: state.error,
        isLoading: state.isLoading,
      })),
    );

  const fromName = fromStop?.name ?? "";
  const toName = toStop?.name ?? "";
  const visibleResults = resultsMatchQuery(
    fromStop?.id,
    toStop?.id,
    resultsQuery,
  )
    ? results
    : [];

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
      <AppText style={styles.noConnectionsText}>
        {t("results.noResults")}
      </AppText>
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
    alignItems: "center",
  },
  noConnectionsText: {
    fontSize: 15,
  },
});
