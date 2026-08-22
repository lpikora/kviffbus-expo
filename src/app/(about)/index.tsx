import Constants from "expo-constants";
import { Href } from "expo-router";
import { useTranslation } from "react-i18next";
import { Linking, Platform, Pressable, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ExternalLink } from "@/components/external-link";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";

export default function AboutScreen() {
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();
  const appConfig = useDataStore((state) => state.appConfig);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="subtitle">{t("App.AppName")}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t("App.AppVersion")} {appVersion}
          {appConfig?.importVersion
            ? ` · ${t("App.TimetablesVersion")} ${appConfig.importVersion}`
            : ""}
        </ThemedText>

        {appConfig?.festivalEditionNumber && appConfig.festivalYear ? (
          <ThemedText>
            {t("HomeScreen.info.line1", {
              edition: appConfig.festivalEditionNumber,
              year: appConfig.festivalYear,
            })}
          </ThemedText>
        ) : null}

        <ThemedText>{t("InfoBanner.description")}</ThemedText>

        {appConfig ? (
          <ThemedView style={styles.links}>
            <ExternalLink href={appConfig.busStopsMapImageUrl as Href & string}>
              <ThemedText type="linkPrimary">
                {t("Drawer.LinkToMapImage")}
              </ThemedText>
            </ExternalLink>
            <ExternalLink
              href={appConfig.officialKViffWebTransportUrl as Href & string}
            >
              <ThemedText type="linkPrimary">
                {t("Drawer.LinkToOfficialTransport")}
              </ThemedText>
            </ExternalLink>
            {appConfig.contactEmail ? (
              <Pressable
                onPress={() =>
                  void Linking.openURL(`mailto:${appConfig.contactEmail}`)
                }
              >
                <ThemedText type="linkPrimary">
                  {t("App.Contact")}: {appConfig.contactEmail}
                </ThemedText>
              </Pressable>
            ) : null}
          </ThemedView>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  links: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
  },
});
