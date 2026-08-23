import { fireEvent, render } from "@testing-library/react-native";

import { StopPairCard } from "@/components/stop-pair-card";
import i18n from "@/i18n";
import { puppStop, thermalStop } from "@/services/__tests__/fixtures";

jest.mock("expo-router", () => ({
  router: { navigate: jest.fn() },
}));

jest.mock("@/services/storage", () => {
  const { createMemoryStorage } =
    require("@/stores/__tests__/memory-storage") as typeof import("@/stores/__tests__/memory-storage");
  return { clientStorage: createMemoryStorage() };
});

import { useSearchStore } from "@/stores/search-store";

describe("<StopPairCard />", () => {
  beforeAll(() => {
    void i18n.changeLanguage("en");
  });

  beforeEach(() => {
    useSearchStore.getState().reset();
    useSearchStore.getState().setFromStop(thermalStop);
    useSearchStore.getState().setToStop(puppStop);
  });

  test("exposes a labeled swap button", async () => {
    const { getByRole } = await render(<StopPairCard />);

    fireEvent.press(getByRole("button", { name: "Swap from and to stops" }));

    expect(useSearchStore.getState().fromStop).toEqual(puppStop);
    expect(useSearchStore.getState().toStop).toEqual(thermalStop);
  });

  test("labels stop fields for assistive tech", async () => {
    const { getByRole } = await render(<StopPairCard />);

    getByRole("button", { name: `From, ${thermalStop.name}` });
    getByRole("button", { name: `To, ${puppStop.name}` });
  });
});
