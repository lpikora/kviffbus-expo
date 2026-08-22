import { useTheme } from "@/hooks/use-theme";
import { ArrowUpDown } from "lucide-react-native";

export function ArrowUpDownIcon() {
  const theme = useTheme();
  return <ArrowUpDown size={24} color={theme.colors.fg} />;
}
