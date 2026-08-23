import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { AppText } from "@/components/app-text";
import { radius, space } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { useTimeToDepartureLabel } from "@/hooks/use-time-to-departure-label";
import {
  formatMinutesToHhMm,
  getDurationBetweenTwoTimes,
} from "@/utils/format-time";

import { BusIcon } from "./icons/bus-icon";

interface Props {
  timeDeparture: number;
  timeArrival: number;
  lineId: string;
  fromName: string;
  toName: string;
  departureDate: Date;
  now: Date;
}

export const ResultsListItem = memo(function ResultsListItem({
  timeDeparture,
  timeArrival,
  lineId,
  fromName,
  toName,
  departureDate,
  now,
}: Props) {
  const theme = useTheme();
  const timeToDeparture = useTimeToDepartureLabel(departureDate, now);
  const durationTime = getDurationBetweenTwoTimes(timeDeparture, timeArrival);
  const departureLabel = formatMinutesToHhMm(timeDeparture);
  const arrivalLabel = formatMinutesToHhMm(timeArrival);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.bgSubtle }]}>
        <AppText variant="caption" style={styles.timeToDeparture}>
          {timeToDeparture}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.durationTime}>
          {durationTime}
        </AppText>
      </View>
      <View style={[styles.body, { backgroundColor: theme.colors.bg }]}>
        <View
          style={[
            styles.busIconContainer,
            { backgroundColor: theme.colors.bg },
          ]}
        >
          <BusIcon />
        </View>
        <View
          style={[styles.bodyContent, { backgroundColor: theme.colors.bg }]}
        >
          <AppText variant="captionBold" style={styles.lineId}>
            {lineId}
          </AppText>
          <View
            style={[
              styles.stopContainer,
              { backgroundColor: theme.colors.bg },
            ]}
          >
            <AppText variant="captionBold" style={styles.stopTime}>
              {departureLabel}
            </AppText>
            <AppText variant="caption">{fromName}</AppText>
          </View>
          <View
            style={[
              styles.stopContainer,
              { backgroundColor: theme.colors.bg },
            ]}
          >
            <AppText variant="captionBold" style={styles.stopTime}>
              {arrivalLabel}
            </AppText>
            <AppText variant="caption">{toName}</AppText>
          </View>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: space[8],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space[24],
    paddingVertical: space[8],
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
    paddingVertical: space[16],
  },
  busIconContainer: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyContent: {
    flex: 1,
    flexDirection: "column",
    gap: space[4],
  },
  lineId: {
    marginBottom: space[4],
  },
  stopContainer: {
    flexDirection: "row",
    gap: space[8],
  },
  stopTime: {
    width: 50,
  },
});
