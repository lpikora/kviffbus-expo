import { DarkTheme, DefaultTheme, Theme } from "expo-router";

import type { AppTheme } from "@/constants/theme";

export function toNavigationTheme(theme: AppTheme): Theme {
  const base = theme.scheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.bg,
      card: theme.colors.bg,
      text: theme.colors.fg,
      border: theme.colors.border,
      primary: theme.colors.accent,
    },
  };
}
