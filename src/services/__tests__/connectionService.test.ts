import { AppError } from "@/errors/appError";
import { ConnectionService } from "@/services/connectionService";
import { ErrorCode } from "@/types/appError";
import { ConnectionDto, ConnectionsMap } from "@/types/connectionDto";
import { TypeOfDepartureDateTimeType } from "@/types/departureDateTimeType";
import { connectionKey } from "@/utils/connection-key";

import {
  makeAppConfig,
  makeConnection,
  makeException,
  puppStop,
  stops,
  thermalStop,
} from "./fixtures";

function toConnectionsMap(connections: ConnectionDto[]): ConnectionsMap {
  const map: ConnectionsMap = {};
  for (const connection of connections) {
    const key = connectionKey(connection.from, connection.to);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(connection);
  }

  for (const key of Object.keys(map)) {
    map[key] = [...map[key]].sort(
      (a, b) =>
        a.departureArrivalTimes.timeDeparture -
        b.departureArrivalTimes.timeDeparture,
    );
  }

  return map;
}

function search(options: {
  connections?: ConnectionDto[];
  connectionsMap?: ConnectionsMap;
  exceptions?: ReturnType<typeof makeException>[];
  appConfig?: ReturnType<typeof makeAppConfig> | null;
  stops?: typeof stops;
  fromStop?: typeof thermalStop | null;
  toStop?: typeof puppStop | null;
  date: Date;
}) {
  return ConnectionService.searchConnections(
    options.connectionsMap ??
      toConnectionsMap(options.connections ?? [makeConnection()]),
    options.stops ?? stops,
    options.exceptions ?? [],
    options.appConfig === undefined ? makeAppConfig() : options.appConfig,
    {
      fromStop: options.fromStop === undefined ? thermalStop : options.fromStop,
      toStop: options.toStop === undefined ? puppStop : options.toStop,
      departureDateTime: {
        type: TypeOfDepartureDateTimeType.dateTime,
        date: options.date,
      },
    },
  );
}

describe("ConnectionService.searchConnections", () => {
  test("throws MissingStops when a stop is missing", () => {
    expect(() =>
      search({ fromStop: null, date: new Date("2026-07-04T10:00:00") }),
    ).toThrow(new AppError(ErrorCode.MissingStops));
  });

  test("throws DataNotReady when appConfig is missing", () => {
    expect(() =>
      search({ appConfig: null, date: new Date("2026-07-04T10:00:00") }),
    ).toThrow(new AppError(ErrorCode.DataNotReady));
  });

  test("throws DataNotReady when stops are empty", () => {
    expect(() =>
      search({ stops: [], date: new Date("2026-07-04T10:00:00") }),
    ).toThrow(new AppError(ErrorCode.DataNotReady));
  });

  test("throws DataNotReady when connections map is empty", () => {
    expect(() =>
      search({
        connectionsMap: {},
        date: new Date("2026-07-04T10:00:00"),
      }),
    ).toThrow(new AppError(ErrorCode.DataNotReady));
  });

  test("allows empty stop exceptions", () => {
    const results = search({
      exceptions: [],
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(results).toHaveLength(2);
    expect(results[0].departureDate.getDate()).toBe(4);
    expect(results[1].departureDate.getDate()).toBe(5);
  });

  test("filters by from and to stops", () => {
    const results = search({
      connections: [
        makeConnection({ id: 1, from: thermalStop.id, to: puppStop.id }),
        makeConnection({ id: 2, from: puppStop.id, to: thermalStop.id }),
      ],
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(results.map((connection) => connection.id)).toEqual([1, 1]);
  });

  test("excludes connections listed in notGoesOn", () => {
    const results = search({
      connections: [
        makeConnection({
          id: 1,
          notGoesOn: ["2026-07-04"],
        }),
      ],
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(results).toHaveLength(1);
    expect(results[0].departureDate.getDate()).toBe(5);
  });

  test("keeps goesOnlyOn connections only on matching dates", () => {
    const connection = makeConnection({
      id: 1,
      goesOnlyOn: ["2026-07-05"],
    });

    expect(
      search({
        connections: [connection],
        date: new Date("2026-07-04T10:00:00"),
      }),
    ).toHaveLength(1);

    expect(
      search({
        connections: [connection],
        date: new Date("2026-07-05T10:00:00"),
      }),
    ).toHaveLength(1);

    expect(
      search({
        connections: [connection],
        date: new Date("2026-07-06T10:00:00"),
      }),
    ).toHaveLength(0);
  });

  test("includes next-day connections after evening departure", () => {
    const results = search({
      connections: [
        makeConnection({
          id: 1,
          departureArrivalTimes: {
            timeDeparture: 480,
            timeArrival: 500,
          },
        }),
        makeConnection({
          id: 2,
          departureArrivalTimes: {
            timeDeparture: 1350,
            timeArrival: 1370,
          },
        }),
      ],
      date: new Date("2026-07-04T22:00:00"),
    });

    expect(results.map((connection) => connection.id)).toEqual([2, 1, 2]);
    expect(results[1].departureDate.getDate()).toBe(5);
  });

  test("hides connections after operationsEndDate unless goesOnlyOn matches", () => {
    const appConfig = makeAppConfig({
      operationsEndDate: "2026-07-05 03:00:00",
    });

    expect(
      search({
        appConfig,
        connections: [makeConnection({ id: 1 })],
        date: new Date("2026-07-06T10:00:00"),
      }),
    ).toHaveLength(0);

    expect(
      search({
        appConfig,
        connections: [
          makeConnection({
            id: 2,
            goesOnlyOn: ["2026-07-06"],
          }),
        ],
        date: new Date("2026-07-06T10:00:00"),
      }),
    ).toHaveLength(1);
  });

  test("does not mutate the input connections when searching", () => {
    const late = makeConnection({
      id: 2,
      departureArrivalTimes: {
        timeDeparture: 840,
        timeArrival: 860,
      },
    });
    const early = makeConnection({
      id: 1,
      departureArrivalTimes: {
        timeDeparture: 720,
        timeArrival: 740,
      },
    });
    const connectionsMap = toConnectionsMap([late, early]);
    const originalOrder = connectionsMap[
      connectionKey(thermalStop.id, puppStop.id)
    ].map((connection) => connection.id);

    const results = search({
      connectionsMap,
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(
      connectionsMap[connectionKey(thermalStop.id, puppStop.id)].map(
        (connection) => connection.id,
      ),
    ).toEqual(originalOrder);
    expect(results.map((connection) => connection.id)).toEqual([1, 2, 1, 2]);
  });

  test("filters out connections during a stop exception", () => {
    const results = search({
      exceptions: [
        makeException({
          id: thermalStop.id,
          fromDate: "2026-07-04",
          fromTime: 600,
          toDate: "2026-07-04",
          toTime: 840,
        }),
      ],
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(results).toHaveLength(1);
    expect(results[0].departureDate.getDate()).toBe(5);
  });
});

describe("ConnectionService.getDurationBetweenTwoTimes", () => {
  test("returns duration across midnight", () => {
    expect(ConnectionService.getDurationBetweenTwoTimes(1430, 10)).toBe(
      "20 min",
    );
  });

  test("returns duration on the same day", () => {
    expect(ConnectionService.getDurationBetweenTwoTimes(750, 775)).toBe(
      "25 min",
    );
  });
});

describe("ConnectionService.formatMinutesToHhMm", () => {
  test("formats minutes from midnight", () => {
    expect(ConnectionService.formatMinutesToHhMm(720)).toBe("12:00");
    expect(ConnectionService.formatMinutesToHhMm(5)).toBe("00:05");
  });
});
