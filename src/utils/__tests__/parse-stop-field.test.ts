import { parseStopField } from "@/utils/parse-stop-field";

describe("parseStopField", () => {
  test("accepts from and to", () => {
    expect(parseStopField("from")).toBe("from");
    expect(parseStopField("to")).toBe("to");
  });

  test("reads the first value from an array", () => {
    expect(parseStopField(["to", "from"])).toBe("to");
  });

  test("returns undefined for invalid or missing values", () => {
    expect(parseStopField("via")).toBeUndefined();
    expect(parseStopField([])).toBeUndefined();
    expect(parseStopField(undefined)).toBeUndefined();
  });
});
