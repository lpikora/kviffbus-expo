import { Platform, Text, type TextProps, type TextStyle } from "react-native";

import { useTheme } from "@/hooks/use-theme";

export type AppTextVariant =
  | "title"
  | "subtitle"
  | "body"
  | "bodyBold"
  | "caption"
  | "captionBold"
  | "code";

export type AppTextTone = "fg" | "muted" | "accent";

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
};

export function AppText({
  variant = "body",
  tone = "fg",
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const color =
    tone === "muted"
      ? theme.colors.fgMuted
      : tone === "accent"
        ? theme.colors.accent
        : theme.colors.fg;
  const typeStyle: TextStyle =
    variant === "code"
      ? {
          fontFamily: theme.fonts.mono,
          fontWeight: Platform.OS === "android" ? "700" : "500",
          fontSize: 12,
        }
      : theme.typography[variant];

  return <Text style={[typeStyle, { color }, style]} {...rest} />;
}
