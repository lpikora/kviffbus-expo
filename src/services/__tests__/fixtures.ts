import { AppConfigDto } from "@/types/appConfigDto";
import { ConnectionDto } from "@/types/connectionDto";
import { DataDto } from "@/types/dataDto";
import { StopDto } from "@/types/stopDto";
import { StopExceptionDto } from "@/types/stopExceptionDto";
import { connectionKey } from "@/utils/connection-key";

export const thermalStop: StopDto = {
  id: 1,
  name: "Hotel Thermal",
  lat: "50.228430",
  lng: "12.878594",
};

export const puppStop: StopDto = {
  id: 2,
  name: "GH Pupp",
  lat: "50.219495",
  lng: "12.881191",
};

export const stops = [thermalStop, puppStop];

export function makeAppConfig(
  overrides: Partial<AppConfigDto> = {},
): AppConfigDto {
  return {
    timetablesPdfUrl: "https://example.com/t.pdf",
    busStopsMapImageUrl: "https://example.com/map.png",
    officialKviffWebUrl: "https://example.com",
    officialKViffWebTransportUrl: "https://example.com/transport",
    appWebUrl: "https://example.com",
    dataUrl: "https://example.com/data.json",
    forceUpdatePackageIds: [],
    timetablesValidTillDate: "2027-10-20",
    operationsStartDate: "2026-07-03 07:00:00",
    operationsEndDate: "2026-10-12 03:00:00",
    importVersion: "2026.2",
    contactEmail: "info@example.com",
    festivalEditionNumber: "60",
    festivalYear: "2026",
    ...overrides,
  };
}

export function makeConnection(
  overrides: Partial<ConnectionDto> = {},
): ConnectionDto {
  return {
    id: 1,
    lineId: "F1",
    from: thermalStop.id,
    to: puppStop.id,
    departureArrivalTimes: {
      timeDeparture: 720,
      timeArrival: 740,
    },
    busNumber: "1",
    goesOnlyOn: [],
    notGoesOn: [],
    ...overrides,
  };
}

export function makeException(
  overrides: Partial<StopExceptionDto> = {},
): StopExceptionDto {
  return {
    id: thermalStop.id,
    fromDate: "2026-07-04",
    fromTime: 600,
    toDate: "2026-07-04",
    toTime: 840,
    ...overrides,
  };
}

export function makeDataDto(overrides: Partial<DataDto> = {}): DataDto {
  const connection = makeConnection();
  return {
    stops,
    connections: {
      [connectionKey(connection.from, connection.to)]: [connection],
    },
    stopExceptions: [],
    appConfig: makeAppConfig(),
    ...overrides,
  };
}
