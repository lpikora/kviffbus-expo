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
    // TODO
    const response = await fetch("https://api.vasedomena.cz/config");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}
