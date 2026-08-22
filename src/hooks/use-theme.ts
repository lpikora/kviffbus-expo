import { themes, type AppTheme } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function useTheme(): AppTheme {
  const scheme = useColorScheme();

  return themes[scheme === "dark" ? "dark" : "light"];
}
