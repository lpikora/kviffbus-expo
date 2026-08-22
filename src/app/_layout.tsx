import { SplashScreen, ThemeProvider } from "expo-router";
import { I18nextProvider } from "react-i18next";

import AppTabs from "@/components/app-tabs";
import { ErrorBoundary } from "@/components/error-boundary";
import { toNavigationTheme } from "@/constants/navigation-theme";
import { useInitData } from "@/hooks/use-sync-data";
import { useTheme } from "@/hooks/use-theme";
import i18n from "@/i18n";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useInitData();

  const theme = useTheme();

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={toNavigationTheme(theme)}>
        <ErrorBoundary>
          <AppTabs />
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}
