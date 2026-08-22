import { render } from "@testing-library/react-native";

import { ErrorMessage } from "@/components/error-message";
import i18n from "@/i18n";
import { ErrorCode } from "@/types/appError";

describe("<ErrorMessage />", () => {
  beforeAll(() => {
    void i18n.changeLanguage("en");
  });

  test("renders the translation for an error code", async () => {
    const { getByText } = await render(
      <ErrorMessage code={ErrorCode.MissingStops} />,
    );

    getByText("Please select both a from and a to stop.");
  });
});
