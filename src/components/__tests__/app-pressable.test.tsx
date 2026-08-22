import { fireEvent, render } from "@testing-library/react-native";

import { AppPressable } from "@/components/app-pressable";
import { AppText } from "@/components/app-text";

describe("<AppPressable />", () => {
  test("defaults to a button role and handles press", async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(
      <AppPressable accessibilityLabel="Retry" onPress={onPress}>
        <AppText>Retry</AppText>
      </AppPressable>,
    );

    fireEvent.press(getByRole("button", { name: "Retry" }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test("allows overriding the accessibility role", async () => {
    const { getByRole } = await render(
      <AppPressable accessibilityRole="link" accessibilityLabel="Contact">
        <AppText>Contact</AppText>
      </AppPressable>,
    );

    getByRole("link", { name: "Contact" });
  });
});
