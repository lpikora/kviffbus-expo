import { TypeOfStopType } from "@/types/stopDto";

export function parseStopField(
  value: string | string[] | undefined,
): TypeOfStopType | undefined {
  const field = Array.isArray(value) ? value[0] : value;
  if (field === "from" || field === "to") {
    return field;
  }
  return undefined;
}
