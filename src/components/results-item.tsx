import { memo } from "react";
import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";
import { ConnectionService } from "@/services/connectionService";
import { BusIcon } from "./bus-icon";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface Props {
  timeDeparture: number;
  timeArrival: number;
  lineId: string;
  fromName: string;
  toName: string;
  departureDate: Date;
}

export const ResultsListItem = memo(function ResultsListItem({
  timeDeparture,
  timeArrival,
  lineId,
  fromName,
  toName,
  departureDate,
}: Props) {
  const timeToDeparture =
    ConnectionService.getDateTimeStringFromNowToDate(departureDate);
  const durationTime = ConnectionService.getDurationBetweenTwoTimes(
    timeDeparture,
    timeArrival,
  );
  const departureLabel = ConnectionService.formatMinutesToHhMm(timeDeparture);
  const arrivalLabel = ConnectionService.formatMinutesToHhMm(timeArrival);

  return (
    <ThemedView style={styles.container}>
      <ThemedView type="backgroundElement" style={styles.header}>
        <ThemedText type="small" style={styles.timeToDeparture}>
          {timeToDeparture}
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.durationTime}
        >
          {durationTime}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.busIconContainer}>
          <BusIcon />
        </ThemedView>
        <ThemedView style={styles.bodyContent}>
          <ThemedText type="smallBold" style={styles.lineId}>
            {lineId}
          </ThemedText>
          <ThemedView style={styles.stopContainer}>
            <ThemedText type="smallBold" style={styles.stopTime}>
              {departureLabel}
            </ThemedText>
            <ThemedText type="small">{fromName}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.stopContainer}>
            <ThemedText type="smallBold" style={styles.stopTime}>
              {arrivalLabel}
            </ThemedText>
            <ThemedText type="small">{toName}</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: Spacing.three,
    overflow: "hidden",
    marginBottom: Spacing.two,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  timeToDeparture: {
    flex: 1,
  },
  durationTime: {
    flex: 1,
    textAlign: "right",
  },
  body: {
    flexDirection: "row",
    paddingVertical: Spacing.three,
  },
  busIconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyContent: {
    flex: 1,
    flexDirection: "column",
    gap: Spacing.one,
  },
  lineId: {
    marginBottom: Spacing.one,
  },
  stopContainer: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  stopTime: {
    width: 50,
  },
});
