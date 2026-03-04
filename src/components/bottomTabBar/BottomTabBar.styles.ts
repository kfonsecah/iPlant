import { StyleSheet } from "react-native";

const tabColors = {
  barBg: "#161B22",
  barBorder: "#21262D",
  active: "#34D399",
  inactive: "#4B5563",
  centerBtnBg: "#34D399",
};

export const tabStyles = StyleSheet.create({
  root: {
    backgroundColor: tabColors.barBg,
    borderTopWidth: 1,
    borderTopColor: tabColors.barBorder,
    overflow: "visible",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 9,
    paddingBottom: 0,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabLabel: {
    color: tabColors.inactive,
    fontSize: 10,
    marginTop: 3,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: tabColors.active,
  },
  centerSpacer: {
    flex: 1.2,
  },
  arcWrapper: {
    position: "absolute",
    top: -29,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 2,
  },
  arcBump: {
    width: 80,
    height: 40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: tabColors.barBg,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: tabColors.barBorder,
  },
  centerButtonWrapper: {
    position: "absolute",
    top: -22,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  centerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: tabColors.centerBtnBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
    shadowColor: tabColors.active,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 12,
  },
});
