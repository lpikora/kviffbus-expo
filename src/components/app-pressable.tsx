import { Pressable, StyleSheet, type PressableProps } from "react-native";

export type AppPressableProps = PressableProps;

export function AppPressable({
  accessibilityRole = "button",
  style,
  ...rest
}: AppPressableProps) {
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        state.pressed && styles.pressed,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.6,
  },
});
