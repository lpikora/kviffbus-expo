import { DataDto } from "@/types/dataDto";
import initialData from "../data.json";

export class DataService {
  static getLocalData(): DataDto {
    return {
      stops: initialData.stops ?? [],
      appConfig: initialData.appConfig ?? null,
      connections: initialData.connections ?? [],
      stopExceptions: initialData.stopExceptions ?? [],
    };
  }

  static async fetchLatestData(): Promise<DataDto> {
    const response = await fetch("https://api.vasedomena.cz/config");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
}
