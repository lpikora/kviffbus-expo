import {
  compareImportVersions,
  isNewerImportVersion,
} from "@/utils/import-version";

describe("compareImportVersions", () => {
  test("treats 2026.10 as newer than 2026.2", () => {
    expect(compareImportVersions("2026.10", "2026.2")).toBeGreaterThan(0);
    expect(isNewerImportVersion("2026.10", "2026.2")).toBe(true);
    expect(isNewerImportVersion("2026.2", "2026.10")).toBe(false);
  });

  test("treats equal versions as not newer", () => {
    expect(compareImportVersions("2026.2", "2026.2")).toBe(0);
    expect(isNewerImportVersion("2026.2", "2026.2")).toBe(false);
  });
});
