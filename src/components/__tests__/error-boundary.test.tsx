import { fireEvent, render } from "@testing-library/react-native";

import { ErrorBoundary } from "@/components/error-boundary";
import i18n from "@/i18n";

describe("<ErrorBoundary />", () => {
  beforeAll(() => {
    void i18n.changeLanguage("en");
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test("renders the fallback and retries", async () => {
    const retry = jest.fn().mockResolvedValue(undefined);
    const { getByText, getByRole } = await render(
      <ErrorBoundary error={new Error("boom")} retry={retry} />,
    );

    getByText("Something went wrong.");
    fireEvent.press(getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
