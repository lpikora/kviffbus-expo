import { memo } from "react";

import { ResultsListItem } from "@/components/results-item";
import { ConnectionResult } from "@/types/connectionResult";

interface Props {
  item: ConnectionResult;
  fromName: string;
  toName: string;
  now: Date;
}

export const ConnectionListItem = memo(function ConnectionListItem({
  item,
  fromName,
  toName,
  now,
}: Props) {
  return (
    <ResultsListItem
      lineId={item.lineId}
      timeDeparture={item.departureArrivalTimes.timeDeparture}
      timeArrival={item.departureArrivalTimes.timeArrival}
      fromName={fromName}
      toName={toName}
      departureDate={item.departureDate}
      now={now}
    />
  );
});
