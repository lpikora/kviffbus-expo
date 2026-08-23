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

  test("compares versions with a different number of segments", () => {
    expect(compareImportVersions("2026.2.1", "2026.2")).toBeGreaterThan(0);
    expect(isNewerImportVersion("2026.2.1", "2026.2")).toBe(true);
    expect(isNewerImportVersion("2026.2", "2026.2.1")).toBe(false);
  });

  test("treats non-numeric segments as zero", () => {
    expect(compareImportVersions("2026.foo", "2026.0")).toBe(0);
    expect(isNewerImportVersion("2026.1", "2026.foo")).toBe(true);
  });
});
