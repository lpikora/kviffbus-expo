import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const dateTimePickerStyles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    paddingBottom: Spacing.four,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  modalButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
