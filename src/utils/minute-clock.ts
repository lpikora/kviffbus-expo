import { useEffect, useState } from "react";
import { AppState } from "react-native";

export function useMinuteNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = setInterval(() => setNow(new Date()), 60_000);

    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setNow(new Date());
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);

  return now;
}