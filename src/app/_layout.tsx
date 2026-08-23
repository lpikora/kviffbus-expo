import { SplashScreen, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { I18nextProvider } from "react-i18next";

import AppTabs from "@/components/app-tabs";
import { toNavigationTheme } from "@/constants/navigation-theme";
import { useInitData } from "@/hooks/use-sync-data";
import { useTheme } from "@/hooks/use-theme";
import i18n from "@/i18n";

SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from "@/components/error-boundary";

export default function TabLayout() {
  useInitData();

  const theme = useTheme();

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={toNavigationTheme(theme)}>
        <StatusBar style={theme.scheme === "dark" ? "light" : "dark"} />
        <AppTabs />
      </ThemeProvider>
    </I18nextProvider>
  );
}
