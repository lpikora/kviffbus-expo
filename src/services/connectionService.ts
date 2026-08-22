import { AppError } from "@/errors/appError";
import i18n from "@/i18n";
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
import moment from "moment";

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

  private static hasStopException(
    exceptions: StopExceptionDto[],
    stopId: number,
    departureDate: Date,
  ) {
    for (const exception of exceptions) {
      if (exception.id === stopId) {
        const fromDate = this.dateWithMinutes(
          new Date(exception.fromDate),
          exception.fromTime,
        );
        const toDate = this.dateWithMinutes(
          new Date(exception.toDate),
          exception.toTime,
        );
        if (departureDate > fromDate && departureDate < toDate) {
          return true;
        }
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
    return connections.filter((connection) => {
      const arrivalDateTime = this.dateWithMinutes(
        connection.departureDate,
        connection.departureArrivalTimes.timeArrival,
      );
      const departureDateTime = this.dateWithMinutes(
        connection.departureDate,
        connection.departureArrivalTimes.timeDeparture,
      );

      if (this.hasStopException(exceptions, toStopId, arrivalDateTime)) {
        return false;
      }

      if (this.hasStopException(exceptions, fromStopId, departureDateTime)) {
        return false;
      }

      return true;
    });
  }

  private static connectionResultsForDate(
    group: ConnectionDto[],
    minDepartureMinutes: number,
    departureDateTime: Date,
    appConfig?: AppConfigDto | null,
  ): ConnectionResult[] {
    const dateKey = this.toDateKey(departureDateTime);
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

    return this.excludeAfterOperationsEnd(
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

  private static excludeAfterOperationsEnd(
    connections: ConnectionResult[],
    departureDate: string,
    appConfig?: AppConfigDto | null,
  ): ConnectionResult[] {
    if (appConfig && appConfig.operationsEndDate) {
      const operationsEndDate = new Date(appConfig.operationsEndDate);
      return connections.filter(
        (connection) =>
          connection.departureDate <= operationsEndDate ||
          connection.goesOnlyOn.includes(departureDate),
      );
    } else {
      return connections;
    }
  }

  private static minutesFromMidnight(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  private static toDateKey(date: Date) {
    const year = date.getFullYear().toString();
    let month = (date.getMonth() + 1).toString();
    let day = date.getDate().toString();
    if (month.length === 1) {
      month = "0" + month;
    }
    if (day.length === 1) {
      day = "0" + day;
    }
    return year + "-" + month + "-" + day;
  }

  private static dateWithMinutes(baseDate: Date, minutesFromMidnight: number) {
    const date = new Date(baseDate);
    date.setHours(
      Math.floor(minutesFromMidnight / 60),
      minutesFromMidnight % 60,
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
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    return tomorrow;
  }

  public static formatMinutesToHhMm(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  }

  public static getDateTimeStringFromNowToDate(date: Date) {
    const nowDate = new Date();
    const seconds = (date.getTime() - nowDate.getTime()) / 1000;
    const todayDateString =
      nowDate.getDate() +
      "-" +
      nowDate.getMonth() +
      "-" +
      nowDate.getFullYear();
    const dateDateString =
      date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);

    if (todayDateString !== dateDateString) {
      return moment(date).calendar(undefined, {
        lastDay: i18n.t("momentCalendarTranslations.lastDay"),
        sameDay: i18n.t("momentCalendarTranslations.sameDay"),
        nextDay: i18n.t("momentCalendarTranslations.nextDay"),
        lastWeek: i18n.t("momentCalendarTranslations.lastWeek"),
        nextWeek: i18n.t("momentCalendarTranslations.nextWeek"),
        sameElse: i18n.t("momentCalendarTranslations.sameElse"),
      });
    }

    if (h <= 0) {
      return moment().to(date);
    }

    return i18n.t("time.in") + " " + (h && h + " h " + m + " min");
  }

  public static getDurationBetweenTwoTimes(
    departureMinutes: number,
    arrivalMinutes: number,
  ) {
    let duration = arrivalMinutes - departureMinutes;
    if (duration < 0) {
      duration += 1440;
    }

    return duration + " min";
  }
}
