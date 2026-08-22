import { AppError, toErrorCode } from "@/errors/appError";
import { ErrorCode } from "@/types/appError";

describe("toErrorCode", () => {
  test("returns the code from AppError", () => {
    expect(toErrorCode(new AppError(ErrorCode.DataNotReady))).toBe(
      ErrorCode.DataNotReady,
    );
  });

  test("maps unknown values to ErrorCode.Unknown", () => {
    expect(toErrorCode(new Error("boom"))).toBe(ErrorCode.Unknown);
    expect(toErrorCode("string")).toBe(ErrorCode.Unknown);
  });
});
