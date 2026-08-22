import { useTheme } from "@/hooks/use-theme";
import { BusFront } from "lucide-react-native";

export function BusIcon() {
  const theme = useTheme();
  return <BusFront size={22} color={theme.colors.fg} />;
}
