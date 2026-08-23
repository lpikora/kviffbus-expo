import { AppError } from "@/errors/appError";
import { ErrorCode } from "@/types/appError";
import { DataDto } from "@/types/dataDto";
import { dataDtoSchema, dataVersionDtoSchema } from "@/types/dataSchema";
import { DataVersionDto } from "@/types/dataVersionDto";

export const REMOTE_DATA_BASE_URL = "https://lpikora.github.io/kviffbus-expo/";
export const REMOTE_DATA_VERSION_FILE = "version.json";
export const DEFAULT_DATA_VERSION_URL = `${REMOTE_DATA_BASE_URL}${REMOTE_DATA_VERSION_FILE}`;
const FETCH_TIMEOUT_MS = 10_000;
const IMPORT_VERSION_PATTERN = /^[0-9A-Za-z._-]+$/;

const NO_CACHE_INIT: RequestInit = {
  cache: "no-store",
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
  },
};

export function parseDataDto(data: unknown): DataDto {
  const result = dataDtoSchema.safeParse(data);
  if (!result.success) {
    throw new AppError(ErrorCode.DataLoadFailed, { cause: result.error });
  }
  return result.data;
}

export function parseDataVersionDto(data: unknown): DataVersionDto {
  const result = dataVersionDtoSchema.safeParse(data);
  if (!result.success) {
    throw new AppError(ErrorCode.DataLoadFailed, { cause: result.error });
  }
  return result.data;
}

export function getRemoteDataUrl(importVersion: string): string {
  if (!IMPORT_VERSION_PATTERN.test(importVersion)) {
    throw new AppError(ErrorCode.DataLoadFailed);
  }

  return `${REMOTE_DATA_BASE_URL}data-${importVersion}.json`;
}

export async function getLocalData(): Promise<DataDto> {
  const localData = (await import("../../assets/data/data.json")) as {
    default: DataDto;
  };
  return localData.default;
}

async function fetchJson(url: string, init: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new AppError(ErrorCode.DataLoadFailed);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.DataLoadFailed, { cause: error });
  } finally {
    clearTimeout(timeoutId);
  }
}

function withCacheBust(url: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}_=${Date.now()}`;
}

export async function getRemoteData(dataUrl: string): Promise<DataDto> {
  return parseDataDto(await fetchJson(dataUrl));
}

export async function getRemoteDataVersion(): Promise<DataVersionDto> {
  return parseDataVersionDto(
    await fetchJson(withCacheBust(DEFAULT_DATA_VERSION_URL), NO_CACHE_INIT),
  );
}
