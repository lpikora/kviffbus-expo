import { AppError } from "@/errors/appError";
import { ErrorCode } from "@/types/appError";
import { DataDto } from "@/types/dataDto";

export class DataService {
  static async getLocalData(): Promise<DataDto> {
    const localData = await import("../../assets/data/data.json");
    return {
      stops: localData.stops ?? [],
      appConfig: localData.appConfig ?? null,
      connections: localData.connections ?? [],
      stopExceptions: localData.stopExceptions ?? [],
    };
  }

  static async getRemoteData(): Promise<DataDto> {
    const response = await fetch("https://kviffbus.cz/data/data.json");
    if (!response.ok) {
      throw new AppError(ErrorCode.DataLoadFailed);
    }
    return await response.json();
  }
}
