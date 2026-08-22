import { AppError } from "@/errors/appError";
import i18n from "@/i18n";
import { AppConfigDto } from "@/types/appConfigDto";
import { ErrorCode } from "@/types/appError";
import { ConnectionDto, ConnectionsMap } from "@/types/connectionDto";
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
  ): ConnectionDto[] {
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

    const departureDayConnections = this.filterAndAnnotateConnections(
      group,
      this.getMinutesFromDate(departureDateTime),
      departureDateTime,
      stops,
      appConfig,
    );
    const nextDayFromDepartureDateTime = this.getNextDayDate(departureDateTime);
    const departureNextDayConnections = this.filterAndAnnotateConnections(
      group,
      0,
      nextDayFromDepartureDateTime,
      stops,
      appConfig,
    );

    return this.filterToStopExceptions(
      departureDayConnections.concat(departureNextDayConnections),
      exceptions,
    );
  }

  private static hasStopException(
    exceptions: StopExceptionDto[],
    stopName: string,
    departureDate: Date,
  ) {
    for (const exception of exceptions) {
      if (exception.stopName === stopName) {
        const fromDate = new Date(exception.fromDate);
        const fromTime = exception.fromTime.split(":");
        fromDate.setHours(+fromTime[0], +fromTime[1]);
        const toDate = new Date(exception.toDate);
        const toTime = exception.toTime.split(":");
        toDate.setHours(+toTime[0], +toTime[1]);
        if (departureDate > fromDate && departureDate < toDate) {
          return true;
        }
      }
    }
    return false;
  }

  private static filterToStopExceptions(
    connections: ConnectionDto[],
    exceptions: StopExceptionDto[],
  ): ConnectionDto[] {
    return connections.filter((connection) => {
      const arrivalDateTime = this.dateWithMinutes(
        connection.departureDate!,
        connection.departureArrivalTimes.timeArrival,
      );
      const departureDateTime = this.dateWithMinutes(
        connection.departureDate!,
        connection.departureArrivalTimes.timeDeparture,
      );

      if (
        this.hasStopException(
          exceptions,
          connection.toName || "",
          arrivalDateTime,
        )
      ) {
        return false;
      }

      if (
        this.hasStopException(
          exceptions,
          connection.fromName || "",
          departureDateTime,
        )
      ) {
        return false;
      }

      return true;
    });
  }

  private static filterAndAnnotateConnections(
    group: ConnectionDto[],
    minDepartureMinutes: number,
    departureDateTime: Date,
    stops: StopDto[],
    appConfig?: AppConfigDto | null,
  ) {
    const departureDate = this.getDateStringFromDate(departureDateTime);
    const fromIndex = this.lowerBound(group, minDepartureMinutes);

    const filteredConnections = [];
    for (let index = fromIndex; index < group.length; index++) {
      const connection = group[index];
      if (connection.notGoesOn.includes(departureDate)) {
        continue;
      }
      if (
        connection.goesOnlyOn.length &&
        !connection.goesOnlyOn.includes(departureDate)
      ) {
        continue;
      }
      filteredConnections.push(connection);
    }

    const nonDuplicitConnections = filteredConnections.filter(
      (connection, index, array) =>
        !array[index - 1] ||
        connection.departureArrivalTimes.timeDeparture !==
          array[index - 1].departureArrivalTimes.timeDeparture,
    );

    const connectionsWithStopNames =
      this.setStopNamesAndDepartureDateToConnections(
        nonDuplicitConnections,
        departureDateTime,
        stops,
      );

    return this.filterConnectionAfterOperationsEndDate(
      connectionsWithStopNames,
      departureDate,
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

  private static filterConnectionAfterOperationsEndDate(
    connections: ConnectionDto[],
    departureDate: string,
    appConfig?: AppConfigDto | null,
  ) {
    if (appConfig && appConfig.operationsEndDate) {
      const operationsEndDate = new Date(appConfig.operationsEndDate);
      return connections.filter(
        (connection: ConnectionDto) =>
          connection.departureDate! <= operationsEndDate ||
          connection.goesOnlyOn.includes(departureDate),
      );
    } else {
      return connections;
    }
  }

  private static getMinutesFromDate(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  private static getDateStringFromDate(date: Date) {
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

  private static stopsArrayToObject(stops: StopDto[]) {
    const stopsObject: Record<number, StopDto> = {};
    for (const stop of stops) {
      stopsObject[stop.id] = stop;
    }
    return stopsObject;
  }

  private static dateWithMinutes(baseDate: Date, minutesFromMidnight: number) {
    const date = new Date(baseDate);
    date.setHours(
      Math.floor(minutesFromMidnight / 60),
      minutesFromMidnight % 60,
    );
    return date;
  }

  private static setStopNamesAndDepartureDateToConnections(
    connections: ConnectionDto[],
    desiredDepartureDate: Date,
    stops: StopDto[],
  ) {
    const stopsObject = this.stopsArrayToObject(stops);
    return connections.map((connection) => {
      return {
        ...connection,
        departureArrivalTimes: { ...connection.departureArrivalTimes },
        fromName: stopsObject[connection.from].name,
        toName: stopsObject[connection.to].name,
        departureDate: this.dateWithMinutes(
          desiredDepartureDate,
          connection.departureArrivalTimes.timeDeparture,
        ),
      };
    });
  }

  private static getNextDayDate(date: Date) {
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
