import { DepartureDateTimeType } from "@/types/departureDateTimeType";

export type DateTimePickerProps = {
  value: DepartureDateTimeType;
  onChange: (value: DepartureDateTimeType) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};
