import { AppError } from "@/errors/appError";
import { ErrorCode } from "@/types/appError";
import { DataDto } from "@/types/dataDto";
import { dataDtoSchema, dataVersionDtoSchema } from "@/types/dataSchema";
import { DataVersionDto } from "@/types/dataVersionDto";

export const DEFAULT_DATA_URL = "https://kviffbus.cz/data/data.json";
export const DEFAULT_DATA_VERSION_URL = "https://kviffbus.cz/data/version.json";
const FETCH_TIMEOUT_MS = 10_000;

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

export function getDataVersionUrl(dataUrl: string = DEFAULT_DATA_URL): string {
  try {
    const url = new URL(dataUrl);
    const segments = url.pathname.split("/");
    segments[segments.length - 1] = "version.json";
    url.pathname = segments.join("/");
    url.search = "";
    return url.toString();
  } catch {
    return DEFAULT_DATA_VERSION_URL;
  }
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

export async function getRemoteData(
  dataUrl: string = DEFAULT_DATA_URL,
): Promise<DataDto> {
  // API JSON is not finished yet — mock remote data from bundled local data in development.
  if (__DEV__) {
    return parseDataDto(await getLocalData());
  }

  return parseDataDto(await fetchJson(dataUrl));
}

export async function getRemoteDataVersion(
  dataUrl: string = DEFAULT_DATA_URL,
): Promise<DataVersionDto> {
  // API JSON is not finished yet — mock remote version from bundled local data in development.
  if (__DEV__) {
    const localData = await getLocalData();
    return parseDataVersionDto({
      importVersion: localData.appConfig.importVersion,
    });
  }

  return parseDataVersionDto(
    await fetchJson(withCacheBust(getDataVersionUrl(dataUrl)), NO_CACHE_INIT),
  );
}
