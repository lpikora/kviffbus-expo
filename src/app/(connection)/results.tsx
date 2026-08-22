import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { AppText } from "@/components/app-text";
import { ErrorMessage } from "@/components/error-message";
import { useConnectionListKeyExtractor } from "@/hooks/use-connection-list-key-extractor";
import { useConnectionListRenderItem } from "@/hooks/use-connection-list-render-item";
import { useTheme } from "@/hooks/use-theme";
import { useSearchStore } from "@/stores/search-store";

export default function ResultsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { results, fromStop, toStop, error, isLoading } = useSearchStore(
    useShallow((state) => ({
      results: state.results,
      fromStop: state.fromStop,
      toStop: state.toStop,
      error: state.error,
      isLoading: state.isLoading,
    })),
  );

  const fromName = fromStop?.name ?? "";
  const toName = toStop?.name ?? "";

  const keyExtractor = useConnectionListKeyExtractor();
  const renderItem = useConnectionListRenderItem(fromName, toName);
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

  if (results && results.length > 0) {
    return (
      <View style={[styles.container, screenBg]}>
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
