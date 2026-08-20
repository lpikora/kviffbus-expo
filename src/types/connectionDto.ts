export interface ConnectionDto {
  id: number;
  lineId: string;
  from: number;
  fromName?: string;
  to: number;
  toName?: string;
  departureArrivalTimes: { timeDeparture: string; timeArrival: string };
  busNumber: string;
  goesOnlyOn: string[];
  notGoesOn: string[];
}
