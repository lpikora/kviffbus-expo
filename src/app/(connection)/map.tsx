import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppText } from "@/components/app-text";
import { MaxContentWidth, radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";

export default function MapScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const mapImageUrl = useDataStore(
    (state) => state.appConfig?.busStopsMapImageUrl,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="caption" tone="muted" style={styles.caption}>
          {t("selectStopFromMapScreen.comingSoon")}
        </AppText>
        {mapImageUrl ? (
          <Image
            source={{ uri: mapImageUrl }}
            style={styles.mapImage}
            contentFit="contain"
            accessibilityLabel={t("selectStopFromMapScreen.title")}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: space[24],
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: MaxContentWidth,
    gap: space[16],
  },
  caption: {
    textAlign: "center",
  },
  mapImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: radius.md,
  },
});
