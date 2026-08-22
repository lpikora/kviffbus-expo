import { Platform } from "react-native";

export const palette = {
  white: "#ffffff",
  black: "#000000",
  navy: "#08111f",
  navyElevated: "#1f2936",
  graySelectedDark: "#2f2f31",
  grayBorderDark: "#3B3B3B",
  grayMuted: "#929198",
  grayMutedLight: "#60646C",
  gray2: "#F0F0F3",
  gray4: "#E0E1E6",
  blue: "#2c70e0",
} as const;

export const space = {
  2: 2,
  4: 4,
  8: 8,
  16: 16,
  24: 24,
  32: 32,
  64: 64,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
} as const;

export const typography = {
  title: { fontSize: 48, lineHeight: 52, fontWeight: "600" as const },
  subtitle: { fontSize: 32, lineHeight: 44, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
  bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: "700" as const },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
  captionBold: { fontSize: 14, lineHeight: 20, fontWeight: "700" as const },
} as const;

export const fonts =
  Platform.select({
    ios: {
      sans: "system-ui",
      serif: "ui-serif",
      rounded: "ui-rounded",
      mono: "ui-monospace",
    },
    default: {
      sans: "normal",
      serif: "serif",
      rounded: "normal",
      mono: "monospace",
    },
  }) ?? {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  };

const shared = { space, radius, typography, fonts };

export const themes = {
  light: {
    scheme: "light" as const,
    colors: {
      fg: palette.black,
      fgMuted: palette.grayMutedLight,
      bg: palette.white,
      bgSubtle: palette.gray2,
      bgSelected: palette.gray4,
      accent: palette.blue,
      border: palette.gray4,
    },
    ...shared,
  },
  dark: {
    scheme: "dark" as const,
    colors: {
      fg: palette.white,
      fgMuted: palette.grayMuted,
      bg: palette.navy,
      bgSubtle: palette.navyElevated,
      bgSelected: palette.graySelectedDark,
      accent: palette.blue,
      border: palette.grayBorderDark,
    },
    ...shared,
  },
} as const;

export type AppTheme = (typeof themes)[keyof typeof themes];

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
