import { memo } from "react";

import { ResultsListItem } from "@/components/results-item";
import { ConnectionDto } from "@/types/connectionDto";

interface Props {
  item: ConnectionDto;
  fromName: string;
  toName: string;
}

export const ConnectionListItem = memo(function ConnectionListItem({
  item,
  fromName,
  toName,
}: Props) {
  return (
    <ResultsListItem
      lineId={item.lineId}
      timeDeparture={item.departureArrivalTimes.timeDeparture}
      timeArrival={item.departureArrivalTimes.timeArrival}
      fromName={fromName}
      toName={toName}
      departureDate={item.departureDate ?? new Date()}
    />
  );
});
