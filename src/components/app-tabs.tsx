import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/hooks/use-theme";

export default function AppTabs() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.bg}
      indicatorColor={colors.bgSubtle}
      labelStyle={{ selected: { color: colors.fg } }}
    >
      <NativeTabs.Trigger name="(connection)">
        <NativeTabs.Trigger.Label>
          {t("HomeScreen.connections")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/connection.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="(about)">
        <NativeTabs.Trigger.Label>
          {t("HomeScreen.about")}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/about.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
