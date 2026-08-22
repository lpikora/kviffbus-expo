import { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

import { getDateTimeStringFromNowToDate } from "@/utils/format-time";

const REFRESH_INTERVAL_MS = 60_000;

export function useTimeToDepartureLabel(departureDate: Date) {
  const departureTime = departureDate.getTime();
  const [label, setLabel] = useState(() =>
    getDateTimeStringFromNowToDate(departureDate),
  );

  useEffect(() => {
    const date = new Date(departureTime);

    const refresh = () => {
      const next = getDateTimeStringFromNowToDate(date);
      setLabel((prev) => (prev === next ? prev : next));
    };

    refresh();
    const intervalId = setInterval(refresh, REFRESH_INTERVAL_MS);

    const onAppStateChange = (state: AppStateStatus) => {
      if (state === "active") {
        refresh();
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [departureTime]);

  return label;
}
