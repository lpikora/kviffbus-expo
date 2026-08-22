import { AppError } from "@/errors/appError";
import { ErrorCode } from "@/types/appError";
import { DataDto } from "@/types/dataDto";
import { dataDtoSchema } from "@/types/dataSchema";

export const DEFAULT_DATA_URL = "https://kviffbus.cz/data/data.json";
const FETCH_TIMEOUT_MS = 10_000;

export function parseDataDto(data: unknown): DataDto {
  const result = dataDtoSchema.safeParse(data);
  if (!result.success) {
    throw new AppError(ErrorCode.DataLoadFailed, { cause: result.error });
  }
  return result.data;
}

export function getJsonModulePayload(module: unknown): unknown {
  if (
    typeof module === "object" &&
    module !== null &&
    "default" in module &&
    (module as { default: unknown }).default !== undefined
  ) {
    return (module as { default: unknown }).default;
  }
  return module;
}

export async function getLocalData(): Promise<DataDto> {
  const localData = await import("../../assets/data/data.json");
  return parseDataDto(getJsonModulePayload(localData));
}

export async function getRemoteData(
  dataUrl: string = DEFAULT_DATA_URL,
): Promise<DataDto> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(dataUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new AppError(ErrorCode.DataLoadFailed);
    }
    return parseDataDto(await response.json());
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(ErrorCode.DataLoadFailed, { cause: error });
  } finally {
    clearTimeout(timeoutId);
  }
}
