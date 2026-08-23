import { ConnectionDto } from "./connectionDto";

export type ConnectionResult = ConnectionDto & {
  departureDate: Date;
};
