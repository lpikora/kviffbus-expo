import Constants from "expo-constants";
import { Href } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/app-text";
import { ExternalLink } from "@/components/external-link";
import { BottomTabInset, MaxContentWidth, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useDataStore } from "@/stores/data-store";

export default function AboutScreen() {
  const { t } = useTranslation();
  const safeAreaInsets = useSafeAreaInsets();
  const bottomInset = safeAreaInsets.bottom + BottomTabInset + space[16];
  const theme = useTheme();
  const appConfig = useDataStore((state) => state.appConfig);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  const contentPlatformStyle =
    Platform.OS === "android"
      ? {
          paddingLeft: safeAreaInsets.left,
          paddingRight: safeAreaInsets.right,
          paddingBottom: bottomInset,
        }
      : undefined;

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.colors.bg }]}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <AppText variant="subtitle">{t("App.AppName")}</AppText>
        <AppText variant="caption" tone="muted">
          {t("App.AppVersion")} {appVersion}
          {appConfig?.importVersion
            ? ` · ${t("App.TimetablesVersion")} ${appConfig.importVersion}`
            : ""}
        </AppText>

        {appConfig?.festivalEditionNumber && appConfig.festivalYear ? (
          <AppText>
            {t("HomeScreen.info.line1", {
              edition: appConfig.festivalEditionNumber,
              year: appConfig.festivalYear,
            })}
          </AppText>
        ) : null}

        <AppText>{t("InfoBanner.description")}</AppText>

        {appConfig ? (
          <View style={[styles.links, { backgroundColor: theme.colors.bg }]}>
            <ExternalLink href={appConfig.busStopsMapImageUrl as Href & string}>
              <AppText variant="caption" tone="accent">
                {t("Drawer.LinkToMapImage")}
              </AppText>
            </ExternalLink>
            <ExternalLink
              href={appConfig.officialKViffWebTransportUrl as Href & string}
            >
              <AppText variant="caption" tone="accent">
                {t("Drawer.LinkToOfficialTransport")}
              </AppText>
            </ExternalLink>
            {appConfig.contactEmail ? (
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={`${t("App.Contact")}: ${appConfig.contactEmail}`}
                onPress={() =>
                  void Linking.openURL(`mailto:${appConfig.contactEmail}`)
                }
              >
                <AppText variant="caption" tone="accent">
                  {t("App.Contact")}: {appConfig.contactEmail}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: space[16],
    flexDirection: "row",
    justifyContent: "center",
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingHorizontal: space[24],
    gap: space[16],
  },
  links: {
    gap: space[8],
    paddingTop: space[8],
  },
});
