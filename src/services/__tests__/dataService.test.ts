import { AppError } from "@/errors/appError";
import {
  DataService,
  DEFAULT_DATA_URL,
  parseDataDto,
} from "@/services/dataService";
import { ErrorCode } from "@/types/appError";

import { makeDataDto } from "./fixtures";

function mockFetch(
  impl: () => Promise<{ ok: boolean; json?: () => Promise<unknown> }>,
) {
  const fetchMock = jest.fn(impl);
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("parseDataDto", () => {
  test("accepts a valid payload", () => {
    const payload = makeDataDto();

    expect(parseDataDto(payload)).toEqual(payload);
  });

  test("rejects a payload that fails the schema", () => {
    expect(() => parseDataDto({ stops: [] })).toThrow(AppError);
    try {
      parseDataDto({ stops: [] });
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(ErrorCode.DataLoadFailed);
    }
  });
});

describe("DataService.getRemoteData", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test("parses a valid remote payload", async () => {
    const payload = makeDataDto();
    const fetchMock = mockFetch(async () => ({
      ok: true,
      json: async () => payload,
    }));

    await expect(DataService.getRemoteData()).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      DEFAULT_DATA_URL,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("uses the provided data URL", async () => {
    const payload = makeDataDto();
    const fetchMock = mockFetch(async () => ({
      ok: true,
      json: async () => payload,
    }));

    await DataService.getRemoteData("https://example.com/custom.json");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/custom.json",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("throws DataLoadFailed on HTTP error", async () => {
    mockFetch(async () => ({
      ok: false,
    }));

    await expect(DataService.getRemoteData()).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });

  test("throws DataLoadFailed when the payload fails the schema", async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ broken: true }),
    }));

    await expect(DataService.getRemoteData()).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });
});
