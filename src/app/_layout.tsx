import {
  DarkTheme,
  DefaultTheme,
  SplashScreen,
  ThemeProvider,
} from "expo-router";
import { useColorScheme } from "react-native";

import AppTabs from "@/components/app-tabs";
import { ErrorBoundary } from "@/components/error-boundary";
import { useInitData } from "@/hooks/use-sync-data";
import i18n from "@/i18n";
import { I18nextProvider } from "react-i18next";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  useInitData();

  const colorScheme = useColorScheme();
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ErrorBoundary>
          <AppTabs />
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}
