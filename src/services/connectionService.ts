import i18n from "@/i18n";
import { AppConfigDto } from "@/types/appConfigDto";
import { ConnectionDto } from "@/types/connectionDto";
import {
  DepartureDateTimeType,
  TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";
import { StopDto } from "@/types/stopDto";
import { StopExceptionDto } from "@/types/stopExceptionDto";
import moment from "moment";

export interface SearchParams {
  fromStop: StopDto | null;
  toStop: StopDto | null;
  departureDateTime: DepartureDateTimeType;
}

export class ConnectionService {
  /**
   * Vyhledá spoje na základě zadaných parametrů z datové sady
   */
  static searchConnections(
    connections: ConnectionDto[],
    stops: StopDto[],
    exceptions: StopExceptionDto[],
    appConfig: AppConfigDto,
    params: SearchParams,
  ): ConnectionDto[] {
    const { fromStop, toStop, departureDateTime: depTime } = params;

    if (!fromStop || !toStop) {
      return [];
    }

    const departureDateTime =
      depTime.type === TypeOfDepartureDateTimeType.now
        ? new Date()
        : (depTime.date ?? new Date());

    const departureDayConnections = this.filterAndSortConnections(
      fromStop.id,
      toStop.id,
      departureDateTime,
      connections,
      stops,
      appConfig,
    );
    const nextDayFromDepartureDateTime = this.getNextDayDate(departureDateTime);
    const departureNextDayConnections = this.filterAndSortConnections(
      fromStop.id,
      toStop.id,
      nextDayFromDepartureDateTime,
      connections,
      stops,
      appConfig,
    );
    const allConections = departureDayConnections.concat(
      departureNextDayConnections,
    );
    return this.filterToStopExceptions(allConections, exceptions);
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
      const timeArrival =
        connection.departureArrivalTimes.timeArrival.split(":");
      const arrivalDateTime = new Date(connection.departureDate!);
      arrivalDateTime.setHours(+timeArrival[0], +timeArrival[1]);

      const timeDeparture =
        connection.departureArrivalTimes.timeDeparture.split(":");
      const departureDateTime = new Date(connection.departureDate!);
      departureDateTime.setHours(+timeDeparture[0], +timeDeparture[1]);

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

  private static filterAndSortConnections(
    fromStop: number,
    toStop: number,
    departureDateTime: Date,
    connections: any[],
    stops: StopDto[],
    appConfig?: AppConfigDto | null,
  ) {
    const departureTime = this.getTimeStringFromDate(departureDateTime);
    const departureDate = this.getDateStringFromDate(departureDateTime);

    const filteredConnections = connections.filter(
      (connection: ConnectionDto) => {
        if (
          connection.from === fromStop &&
          connection.to === toStop &&
          !connection.notGoesOn.includes(departureDate)
        ) {
          if (connection.goesOnlyOn.length) {
            if (connection.goesOnlyOn.includes(departureDate)) {
              return true;
            } else {
              return false;
            }
          }
          return true;
        }
        return false;
      },
    );

    const sortedfilteredConnections =
      this.sortConnectionTimes(filteredConnections);

    // filter duplicite when bus going back and througt same stops
    const nonDuplicitConnections = sortedfilteredConnections.filter(
      (connection, index, array) =>
        !array[index - 1] ||
        connection.departureArrivalTimes.timeDeparture !==
          array[index - 1].departureArrivalTimes.timeDeparture,
    );

    const nonPastConnections = this.filterPastConnections(
      nonDuplicitConnections,
      departureTime,
    );

    const nonDuplicitConnectionsWithStopNames =
      this.setStopNamesAndDepartureDateToConnections(
        nonPastConnections,
        departureDateTime,
        stops,
      );

    const connectionNonAfterOperationsEnd =
      this.filterConnectionAfterOperationsEndDate(
        nonDuplicitConnectionsWithStopNames,
        departureDate,
        appConfig,
      );

    return connectionNonAfterOperationsEnd;
  }

  private static sortConnectionTimes(connections: ConnectionDto[]) {
    return connections.sort((a: ConnectionDto, b: ConnectionDto) => {
      const aParts = this.getTimeNumericParts(
        a.departureArrivalTimes.timeDeparture,
      );
      const bParts = this.getTimeNumericParts(
        b.departureArrivalTimes.timeDeparture,
      );

      // Sorts by hour then minute
      return aParts[0] - bParts[0] || aParts[1] - bParts[1];
    });
  }

  private static filterPastConnections(
    connections: ConnectionDto[],
    departureTimeString: string,
  ) {
    return connections.filter((connection: ConnectionDto) => {
      const connectionDeparture = this.getTimeNumericParts(
        connection.departureArrivalTimes.timeDeparture,
      );
      const desiredDeparture = this.getTimeNumericParts(departureTimeString);
      return (
        connectionDeparture[0] > desiredDeparture[0] ||
        (connectionDeparture[0] === desiredDeparture[0] &&
          connectionDeparture[1] >= desiredDeparture[1])
      );
    });
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

  private static getTimeStringFromDate(date: Date) {
    let hour = date.getHours().toString();
    let minute = date.getMinutes().toString();
    if (hour.length === 1) {
      hour = "0" + hour;
    }
    if (minute.length === 1) {
      minute = "0" + minute;
    }

    return hour + ":" + minute;
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
    const stopsObject: any = {};
    for (const stop of stops) {
      stopsObject[stop.id] = stop;
    }
    return stopsObject;
  }

  private static setStopNamesAndDepartureDateToConnections(
    connections: ConnectionDto[],
    dasiredDepartureDate: Date,
    stops: StopDto[],
  ) {
    const stopsObject = this.stopsArrayToObject(stops);
    const resConnections: ConnectionDto[] = JSON.parse(
      JSON.stringify(connections),
    );
    resConnections.forEach((connection) => {
      const timeHoursMinutes = this.getTimeNumericParts(
        connection.departureArrivalTimes.timeDeparture,
      );
      const connectionDepartureDate = new Date(dasiredDepartureDate);
      connectionDepartureDate.setHours(timeHoursMinutes[0]);
      connectionDepartureDate.setMinutes(timeHoursMinutes[1]);
      connection.fromName = stopsObject[connection.from].name;
      connection.toName = stopsObject[connection.to].name;
      connection.departureDate = connectionDepartureDate;
    });
    return resConnections;
  }

  private static getNextDayDate(date: Date) {
    const tomorrow = new Date(date);
    tomorrow.setDate(date.getDate() + 1);
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    return tomorrow;
  }

  private static getTimeNumericParts(time: string) {
    return time.split(":").map((x) => +x);
  }

  private static getDateTimeStringFromNowToDate(date: Date) {
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

  private static getDurationBetweenTwoTimes(
    departureTime: string,
    arrivalTime: string,
  ) {
    const departure = moment(departureTime, "HH:mm");
    const arrival = moment(arrivalTime, "HH:mm");

    if (arrival < departure) {
      arrival.add(1, "days");
    }

    return moment.duration(arrival.diff(departure)).asMinutes() + " min";
  }
}
