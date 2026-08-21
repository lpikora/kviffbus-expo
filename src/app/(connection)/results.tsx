import { FlatList, Platform, StyleSheet } from "react-native";
import { useShallow } from "zustand/react/shallow";

import { useConnectionListKeyExtractor } from "@/hooks/use-connection-list-key-extractor";
import { useConnectionListRenderItem } from "@/hooks/use-connection-list-render-item";
import { ErrorMessage } from "@/components/error-message";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRootStore } from "@/stores/rootStore";
import { t } from "i18next";

export default function ResultsScreen() {
  const { results, fromStop, toStop, error } = useRootStore(
    useShallow((state) => ({
      results: state.results,
      fromStop: state.fromStop,
      toStop: state.toStop,
      error: state.error,
    })),
  );

  const fromName = fromStop?.name ?? "";
  const toName = toStop?.name ?? "";

  const keyExtractor = useConnectionListKeyExtractor();
  const renderItem = useConnectionListRenderItem(fromName, toName);

  if (error) {
    return (
      <ThemedView style={styles.noConnectionsContainer}>
        <ErrorMessage code={error} />
      </ThemedView>
    );
  }

  if (results && results.length > 0) {
    return (
      <ThemedView style={styles.container}>
        <FlatList
          data={results}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          extraData={`${fromName}-${toName}`}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
          contentContainerStyle={styles.listContent}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.noConnectionsContainer}>
      <ThemedText style={styles.noConnectionsText}>
        {t("results.noResults")}
      </ThemedText>
    </ThemedView>
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
