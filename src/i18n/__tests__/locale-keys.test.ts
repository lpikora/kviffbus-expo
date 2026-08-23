import cs from "@/i18n/locales/cs";
import en from "@/i18n/locales/en";

function collectKeys(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object") {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("i18n locales", () => {
  test("cs and en expose the same translation keys", () => {
    expect(collectKeys(cs).sort()).toEqual(collectKeys(en).sort());
  });
});
