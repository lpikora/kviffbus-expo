import { AppError } from "@/errors/appError";
import { ConnectionService } from "@/services/connectionService";
import { ErrorCode } from "@/types/appError";
import { TypeOfDepartureDateTimeType } from "@/types/departureDateTimeType";

import {
  makeAppConfig,
  makeConnection,
  makeException,
  puppStop,
  stops,
  thermalStop,
} from "./fixtures";

function search(options: {
  connections?: ReturnType<typeof makeConnection>[];
  exceptions?: ReturnType<typeof makeException>[];
  appConfig?: ReturnType<typeof makeAppConfig> | null;
  stops?: typeof stops;
  fromStop?: typeof thermalStop | null;
  toStop?: typeof puppStop | null;
  date: Date;
}) {
  return ConnectionService.searchConnections(
    options.connections ?? [makeConnection()],
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

  test("throws DataNotReady when connections are empty", () => {
    expect(() =>
      search({ connections: [], date: new Date("2026-07-04T10:00:00") }),
    ).toThrow(new AppError(ErrorCode.DataNotReady));
  });

  test("allows empty stop exceptions", () => {
    const results = search({
      exceptions: [],
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(results).toHaveLength(2);
    expect(results[0].fromName).toBe(thermalStop.name);
    expect(results[0].toName).toBe(puppStop.name);
    expect(results[0].departureDate?.getDate()).toBe(4);
    expect(results[1].departureDate?.getDate()).toBe(5);
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
    expect(results[0].departureDate?.getDate()).toBe(5);
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
            timeDeparture: "08:00",
            timeArrival: "08:20",
          },
        }),
        makeConnection({
          id: 2,
          departureArrivalTimes: {
            timeDeparture: "22:30",
            timeArrival: "22:50",
          },
        }),
      ],
      date: new Date("2026-07-04T22:00:00"),
    });

    expect(results.map((connection) => connection.id)).toEqual([2, 1, 2]);
    expect(results[1].departureDate?.getDate()).toBe(5);
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

  test("does not mutate the input connections array when sorting", () => {
    const connections = [
      makeConnection({
        id: 2,
        departureArrivalTimes: {
          timeDeparture: "14:00",
          timeArrival: "14:20",
        },
      }),
      makeConnection({
        id: 1,
        departureArrivalTimes: {
          timeDeparture: "12:00",
          timeArrival: "12:20",
        },
      }),
    ];

    const results = search({
      connections,
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(connections.map((connection) => connection.id)).toEqual([2, 1]);
    expect(results.map((connection) => connection.id)).toEqual([1, 2, 1, 2]);
  });

  test("filters out connections during a stop exception", () => {
    const results = search({
      exceptions: [
        makeException({
          stopName: thermalStop.name,
          fromDate: "2026-07-04",
          fromTime: "10:00",
          toDate: "2026-07-04",
          toTime: "14:00",
        }),
      ],
      date: new Date("2026-07-04T10:00:00"),
    });

    expect(results).toHaveLength(1);
    expect(results[0].departureDate?.getDate()).toBe(5);
  });
});

describe("ConnectionService.getDurationBetweenTwoTimes", () => {
  test("returns duration across midnight", () => {
    expect(ConnectionService.getDurationBetweenTwoTimes("23:50", "00:10")).toBe(
      "20 min",
    );
  });

  test("returns duration on the same day", () => {
    expect(ConnectionService.getDurationBetweenTwoTimes("12:30", "12:55")).toBe(
      "25 min",
    );
  });
});
