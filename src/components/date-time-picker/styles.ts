import { StyleSheet } from "react-native";

import { radius, space } from "@/constants/theme";

export const dateTimePickerStyles = StyleSheet.create({
  row: {
    paddingHorizontal: space[24],
    paddingVertical: space[16],
    gap: space[4],
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
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: space[24],
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: space[24],
    paddingTop: space[8],
  },
  modalButton: {
    paddingVertical: space[8],
    paddingHorizontal: space[16],
  },
});
