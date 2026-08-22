import { Image } from "expo-image";
import { ScrollView, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { useDataStore } from "@/stores/data-store";

export default function MapScreen() {
  const { t } = useTranslation();
  const mapImageUrl = useDataStore(
    (state) => state.appConfig?.busStopsMapImageUrl,
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="small" themeColor="textSecondary" style={styles.caption}>
          {t("selectStopFromMapScreen.comingSoon")}
        </ThemedText>
        {mapImageUrl ? (
          <Image
            source={{ uri: mapImageUrl }}
            style={styles.mapImage}
            contentFit="contain"
            accessibilityLabel={t("selectStopFromMapScreen.title")}
          />
        ) : null}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
  },
  caption: {
    textAlign: "center",
  },
  mapImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: Spacing.three,
  },
});
