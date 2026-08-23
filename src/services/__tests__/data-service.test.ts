import { AppError } from "@/errors/appError";
import {
  DEFAULT_DATA_VERSION_URL,
  getRemoteData,
  getRemoteDataUrl,
  getRemoteDataVersion,
  parseDataDto,
  parseDataVersionDto,
} from "@/services/data-service";
import { ErrorCode } from "@/types/appError";

import bundledData from "../../../assets/data/data.json";
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

  test("strips connection annotation fields that are not in the JSON schema", () => {
    const payload = makeDataDto();
    const key = Object.keys(payload.connections)[0];
    const connection = payload.connections[key][0];

    const parsed = parseDataDto({
      ...payload,
      connections: {
        ...payload.connections,
        [key]: [
          {
            ...connection,
            fromName: "Hotel Thermal",
            toName: "GH Pupp",
            departureDate: "2026-07-04",
          },
        ],
      },
    });

    expect(parsed.connections[key][0]).toEqual(connection);
    expect(parsed.connections[key][0]).not.toHaveProperty("fromName");
    expect(parsed.connections[key][0]).not.toHaveProperty("toName");
    expect(parsed.connections[key][0]).not.toHaveProperty("departureDate");
  });
});

describe("bundled data", () => {
  test("assets/data/data.json matches DataDto", () => {
    expect(() => parseDataDto(bundledData)).not.toThrow();
  });
});

describe("parseDataVersionDto", () => {
  test("accepts a valid version payload", () => {
    expect(parseDataVersionDto({ importVersion: "2026.4" })).toEqual({
      importVersion: "2026.4",
    });
  });

  test("rejects a payload that fails the schema", () => {
    expect(() => parseDataVersionDto({})).toThrow(AppError);
  });
});

describe("getRemoteDataUrl", () => {
  test("builds a versioned data snapshot URL from the remote base", () => {
    expect(getRemoteDataUrl("2026.2")).toBe(
      "https://lpikora.github.io/kviffbus-expo/data-2026.2.json",
    );
  });

  test("rejects an unsafe importVersion", () => {
    expect(() => getRemoteDataUrl("../secret")).toThrow(AppError);
    expect(() => getRemoteDataUrl("2026/2")).toThrow(AppError);
  });
});

describe("getRemoteData", () => {
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

    const dataUrl = getRemoteDataUrl("2026.2");
    await expect(getRemoteData(dataUrl)).resolves.toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      dataUrl,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("uses the provided data URL", async () => {
    const payload = makeDataDto();
    const fetchMock = mockFetch(async () => ({
      ok: true,
      json: async () => payload,
    }));

    await getRemoteData("https://example.com/custom.json");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/custom.json",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  test("throws DataLoadFailed on HTTP error", async () => {
    mockFetch(async () => ({
      ok: false,
    }));

    await expect(getRemoteData(getRemoteDataUrl("2026.2"))).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });

  test("throws DataLoadFailed when the payload fails the schema", async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ broken: true }),
    }));

    await expect(getRemoteData(getRemoteDataUrl("2026.2"))).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });

  test("throws DataLoadFailed when fetch rejects", async () => {
    mockFetch(async () => {
      throw new Error("network down");
    });

    await expect(getRemoteData(getRemoteDataUrl("2026.2"))).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });

  test("throws DataLoadFailed when the request is aborted", async () => {
    mockFetch(async () => {
      throw new DOMException("The operation was aborted.", "AbortError");
    });

    await expect(getRemoteData(getRemoteDataUrl("2026.2"))).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });
});

describe("getRemoteDataVersion", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  test("parses a valid remote version payload without caching", async () => {
    const fetchMock = mockFetch(async () => ({
      ok: true,
      json: async () => ({ importVersion: "2026.4" }),
    }));

    await expect(getRemoteDataVersion()).resolves.toEqual({
      importVersion: "2026.4",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(
          `^${DEFAULT_DATA_VERSION_URL.replaceAll(".", "\\.")}\\?_=\\d+$`,
        ),
      ),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
        cache: "no-store",
        headers: expect.objectContaining({
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        }),
      }),
    );
  });

  test("throws DataLoadFailed on HTTP error", async () => {
    mockFetch(async () => ({
      ok: false,
    }));

    await expect(getRemoteDataVersion()).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });

  test("throws DataLoadFailed when the payload fails the schema", async () => {
    mockFetch(async () => ({
      ok: true,
      json: async () => ({ broken: true }),
    }));

    await expect(getRemoteDataVersion()).rejects.toMatchObject({
      name: "AppError",
      code: ErrorCode.DataLoadFailed,
    });
  });
});
