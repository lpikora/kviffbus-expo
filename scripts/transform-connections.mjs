import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

const connectionKey = (from, to) => (from << 16) | to;

const timeToMinutes = (time, field, connectionId) => {
  const match = TIME_PATTERN.exec(time);
  if (!match) {
    throw new Error(
      `Malformed ${field} "${time}" on connection id ${connectionId}`,
    );
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    throw new Error(
      `Out-of-range ${field} "${time}" on connection id ${connectionId}`,
    );
  }

  return hours * 60 + minutes;
};

const dataPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "assets",
  "data",
  "data.json",
);

const raw = await readFile(dataPath, "utf8");
const data = JSON.parse(raw);

if (!Array.isArray(data.connections)) {
  throw new Error("connections is not an array; already transformed?");
}

const connections = {};

for (const connection of data.connections) {
  const key = String(connectionKey(connection.from, connection.to));
  const transformed = {
    ...connection,
    departureArrivalTimes: {
      timeDeparture: timeToMinutes(
        connection.departureArrivalTimes.timeDeparture,
        "timeDeparture",
        connection.id,
      ),
      timeArrival: timeToMinutes(
        connection.departureArrivalTimes.timeArrival,
        "timeArrival",
        connection.id,
      ),
    },
  };

  if (!connections[key]) {
    connections[key] = [];
  }
  connections[key].push(transformed);
}

for (const group of Object.values(connections)) {
  group.sort(
    (a, b) =>
      a.departureArrivalTimes.timeDeparture -
      b.departureArrivalTimes.timeDeparture,
  );
}

data.connections = connections;

const transformedDataPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "assets",
  "data",
  "data-transformed.json",
);

await writeFile(transformedDataPath, `${JSON.stringify(data, null, 2)}\n`);

console.log(
  `Wrote ${Object.keys(connections).length} connection groups to ${dataPath}`,
);
