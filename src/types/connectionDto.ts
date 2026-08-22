export interface ConnectionDto {
  id: number;
  lineId: string;
  from: number;
  fromName?: string;
  to: number;
  toName?: string;
  departureDate?: Date;
  departureArrivalTimes: { timeDeparture: number; timeArrival: number };
  busNumber: string;
  goesOnlyOn: string[];
  notGoesOn: string[];
}

export type ConnectionsMap = Record<string, ConnectionDto[]>;
