import { AppError } from "@/errors/appError";
import { AppConfigDto } from "@/types/appConfigDto";
import { ErrorCode } from "@/types/appError";
import { ConnectionDto, ConnectionsMap } from "@/types/connectionDto";
import { ConnectionResult } from "@/types/connectionResult";
import {
  DepartureDateTimeType,
  TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";
import { StopDto } from "@/types/stopDto";
import { StopExceptionDto } from "@/types/stopExceptionDto";
import { connectionKey } from "@/utils/connection-key";
import { toDateKey } from "@/utils/format-time";

export interface SearchParams {
  fromStop: StopDto | null;
  toStop: StopDto | null;
  departureDateTime: DepartureDateTimeType;
}

export class ConnectionService {
  static searchConnections(
    connections: ConnectionsMap,
    stops: StopDto[],
    exceptions: StopExceptionDto[],
    appConfig: AppConfigDto | null,
    params: SearchParams,
  ): ConnectionResult[] {
    const { fromStop, toStop, departureDateTime: depTime } = params;

    if (!fromStop || !toStop) {
      throw new AppError(ErrorCode.MissingStops);
    }
    if (!appConfig) {
      throw new AppError(ErrorCode.DataNotReady);
    }
    if (stops.length === 0) {
      throw new AppError(ErrorCode.DataNotReady);
    }
    if (Object.keys(connections).length === 0) {
      throw new AppError(ErrorCode.DataNotReady);
    }

    const departureDateTime =
      depTime.type === TypeOfDepartureDateTimeType.now
        ? new Date()
        : (depTime.date ?? new Date());

    const group = connections[connectionKey(fromStop.id, toStop.id)] ?? [];

    const sameDayResults = this.connectionResultsForDate(
      group,
      this.minutesFromMidnight(departureDateTime),
      departureDateTime,
      appConfig,
    );
    const nextDay = this.nextDayAtMidnight(departureDateTime);
    const nextDayResults = this.connectionResultsForDate(
      group,
      0,
      nextDay,
      appConfig,
    );

    return this.excludeStopExceptions(
      sameDayResults.concat(nextDayResults),
      exceptions,
      fromStop.id,
      toStop.id,
    );
  }

  private static exceptionsByStopId(exceptions: StopExceptionDto[]) {
    const byStopId = new Map<number, StopExceptionDto[]>();
    for (const exception of exceptions) {
      const list = byStopId.get(exception.id);
      if (list) {
        list.push(exception);
      } else {
        byStopId.set(exception.id, [exception]);
      }
    }
    return byStopId;
  }

  private static hasStopException(
    exceptions: StopExceptionDto[] | undefined,
    atDate: Date,
  ) {
    if (!exceptions) {
      return false;
    }

    for (const exception of exceptions) {
      const fromDate = this.dateWithMinutes(
        this.dateFromKey(exception.fromDate),
        exception.fromTime,
      );
      const toDate = this.dateWithMinutes(
        this.dateFromKey(exception.toDate),
        exception.toTime,
      );
      if (atDate >= fromDate && atDate < toDate) {
        return true;
      }
    }
    return false;
  }

  private static excludeStopExceptions(
    connections: ConnectionResult[],
    exceptions: StopExceptionDto[],
    fromStopId: number,
    toStopId: number,
  ): ConnectionResult[] {
    const exceptionsByStopId = this.exceptionsByStopId(exceptions);

    return connections.filter((connection) => {
      const { timeDeparture, timeArrival } = connection.departureArrivalTimes;
      const departureDateTime = this.dateWithMinutes(
        connection.departureDate,
        timeDeparture,
      );
      const arrivalDateTime = this.dateWithMinutes(
        connection.departureDate,
        timeArrival,
      );
      if (timeArrival < timeDeparture) {
        arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
      }

      if (
        this.hasStopException(exceptionsByStopId.get(toStopId), arrivalDateTime)
      ) {
        return false;
      }

      if (
        this.hasStopException(
          exceptionsByStopId.get(fromStopId),
          departureDateTime,
        )
      ) {
        return false;
      }

      return true;
    });
  }

  private static connectionResultsForDate(
    group: ConnectionDto[],
    minDepartureMinutes: number,
    departureDateTime: Date,
    appConfig: AppConfigDto,
  ): ConnectionResult[] {
    const dateKey = toDateKey(departureDateTime);
    const fromIndex = this.lowerBound(group, minDepartureMinutes);

    const matching: ConnectionDto[] = [];
    for (let index = fromIndex; index < group.length; index++) {
      const connection = group[index];
      if (connection.notGoesOn.includes(dateKey)) {
        continue;
      }
      if (
        connection.goesOnlyOn.length &&
        !connection.goesOnlyOn.includes(dateKey)
      ) {
        continue;
      }
      matching.push(connection);
    }

    const uniqueByDeparture = matching.filter(
      (connection, index, array) =>
        !array[index - 1] ||
        connection.departureArrivalTimes.timeDeparture !==
          array[index - 1].departureArrivalTimes.timeDeparture,
    );

    return this.excludeOutsideOperations(
      this.toConnectionResults(uniqueByDeparture, departureDateTime),
      dateKey,
      appConfig,
    );
  }

  private static lowerBound(
    connections: ConnectionDto[],
    minDepartureMinutes: number,
  ) {
    let lo = 0;
    let hi = connections.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (
        connections[mid].departureArrivalTimes.timeDeparture <
        minDepartureMinutes
      ) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    return lo;
  }

  private static excludeOutsideOperations(
    connections: ConnectionResult[],
    departureDate: string,
    appConfig: AppConfigDto,
  ): ConnectionResult[] {
    const operationsStartDate = appConfig.operationsStartDate
      ? new Date(appConfig.operationsStartDate)
      : null;
    const operationsEndDate = appConfig.operationsEndDate
      ? new Date(appConfig.operationsEndDate)
      : null;

    if (!operationsStartDate && !operationsEndDate) {
      return connections;
    }

    return connections.filter((connection) => {
      if (connection.goesOnlyOn.includes(departureDate)) {
        return true;
      }
      if (
        operationsStartDate &&
        connection.departureDate < operationsStartDate
      ) {
        return false;
      }
      if (operationsEndDate && connection.departureDate > operationsEndDate) {
        return false;
      }
      return true;
    });
  }

  private static minutesFromMidnight(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  private static dateFromKey(dateKey: string) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private static dateWithMinutes(baseDate: Date, minutesFromMidnight: number) {
    const date = new Date(baseDate);
    date.setHours(
      Math.floor(minutesFromMidnight / 60),
      minutesFromMidnight % 60,
      0,
      0,
    );
    return date;
  }

  private static toConnectionResults(
    connections: ConnectionDto[],
    desiredDepartureDate: Date,
  ): ConnectionResult[] {
    return connections.map((connection) => ({
      ...connection,
      departureArrivalTimes: { ...connection.departureArrivalTimes },
      departureDate: this.dateWithMinutes(
        desiredDepartureDate,
        connection.departureArrivalTimes.timeDeparture,
      ),
    }));
  }

  private static nextDayAtMidnight(date: Date) {
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}
