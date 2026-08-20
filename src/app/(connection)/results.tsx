import { FlatList, StyleSheet, View } from "react-native";

import { ResultsListItem } from "@/components/results-item";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRootStore } from "@/stores/rootStore";
import { ConnectionDto } from "@/types/connectionDto";
import { t } from "i18next";

export default function ResultsScreen() {
  const results = useRootStore((state) => state.results);
  const fromStop = useRootStore((state) => state.fromStop);
  const toStop = useRootStore((state) => state.toStop);

  const keyExtractor = (item: ConnectionDto) =>
    item.id.toString() + item.departureDate?.toDateString();

  const renderItem = (item: ConnectionDto) => {
    return (
      <View style={styles.container}>
        <ResultsListItem
          lineId={item.lineId}
          timeDeparture={item.departureArrivalTimes.timeDeparture}
          timeArrival={item.departureArrivalTimes.timeArrival}
          fromName={fromStop?.name || ""}
          toName={toStop?.name || ""}
          departureDate={item.departureDate ?? new Date()}
        />
      </View>
    );
  };

  if (results && results.length > 0) {
    return (
      <ThemedView style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          keyExtractor={keyExtractor}
          data={results}
          renderItem={({ item }) => renderItem(item)}
          extraData={[fromStop, toStop]}
        />
      </ThemedView>
    );
  } else {
    return (
      <ThemedView style={styles.noConnectionsContainer}>
        <ThemedText style={styles.noConnectionsText}>
          {t("results.noResults")}
        </ThemedText>
      </ThemedView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  noConnectionsContainer: {
    flex: 1,
    paddingTop: 30,
    alignItems: "center",
  },
  bannerContainer: {
    paddingVertical: 20,
  },
  noConnectionsText: {
    fontSize: 15,
  },
});
