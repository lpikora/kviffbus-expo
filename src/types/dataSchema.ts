import { z } from "zod";

export const stopSchema = z.object({
  id: z.number(),
  name: z.string(),
  lat: z.string(),
  lng: z.string(),
});

export const connectionSchema = z.object({
  id: z.number(),
  lineId: z.string(),
  from: z.number(),
  to: z.number(),
  departureArrivalTimes: z.object({
    timeDeparture: z.number(),
    timeArrival: z.number(),
  }),
  busNumber: z.string(),
  goesOnlyOn: z.array(z.string()),
  notGoesOn: z.array(z.string()),
});

export const stopExceptionSchema = z.object({
  id: z.number(),
  fromDate: z.string(),
  fromTime: z.number(),
  toDate: z.string(),
  toTime: z.number(),
});

export const appConfigSchema = z.object({
  timetablesPdfUrl: z.string(),
  busStopsMapImageUrl: z.string(),
  officialKviffWebUrl: z.string(),
  officialKViffWebTransportUrl: z.string(),
  appWebUrl: z.string(),
  dataUrl: z.string(),
  forceUpdatePackageIds: z.array(z.string()),
  timetablesValidTillDate: z.string(),
  operationsStartDate: z.string(),
  operationsEndDate: z.string(),
  importVersion: z.string(),
  contactEmail: z.string(),
  festivalEditionNumber: z.string(),
  festivalYear: z.string(),
});

export const dataDtoSchema = z.object({
  stops: z.array(stopSchema),
  connections: z.record(z.string(), z.array(connectionSchema)),
  stopExceptions: z.array(stopExceptionSchema),
  appConfig: appConfigSchema,
});
