import { useTheme } from "@/hooks/use-theme";
import { Clock } from "lucide-react-native";

export function ClockIcon() {
  const theme = useTheme();
  return (
    <Clock
      size={22}
      color={theme.colors.fg}
      accessible={false}
      importantForAccessibility="no"
    />
  );
}
