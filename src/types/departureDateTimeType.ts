export enum TypeOfDepartureDateTimeType {
  now,
  dateTime
}

export interface DepartureDateTimeType {
  type: TypeOfDepartureDateTimeType;
  date: Date | null;
}
