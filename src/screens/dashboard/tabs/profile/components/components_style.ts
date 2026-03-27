import { Platform, StyleSheet } from "react-native";
import { ERP_COLOR_CODE } from "../../../../../utils/constants";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 40 : 4,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    borderBottomWidth: 1,
  },
  back: {
    width: 24,
    height: 24,
    tintColor: ERP_COLOR_CODE.ERP_WHITE,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: ERP_COLOR_CODE.ERP_WHITE,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: ERP_COLOR_CODE.ERP_BLACK,
    fontWeight: "600",
  },
  accountsList: {
    flex: 1,
    padding: 12,
  },
  accountItem: {
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
  },
  activeAccount: {
    borderColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
  accountContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: ERP_COLOR_CODE.ERP_e0e0e0,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  accountInfo: {
    flex: 1,
    paddingRight: 12,
  },
  accountName: {
    width: "90%",
    fontSize: 16,
    fontWeight: "600",
    color: ERP_COLOR_CODE.ERP_333,
  },
  accountEmail: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_666,
    marginBottom: 4,
  },
  lastLogin: {
    fontSize: 12,
    color: ERP_COLOR_CODE.ERP_999,
  },
  activeText: {
    color: ERP_COLOR_CODE.ERP_BLACK,
  },
  activeIndicator: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
  },
  activeLabel: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 12,
    fontWeight: "600",
  },
  removeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ERP_COLOR_CODE.ERP_ERROR,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
  addAccountButton: {
    margin: 16,
    padding: 16,
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    //  shadowColor: ERP_COLOR_CODE.ERP_BLACK,
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.6,
    // marginTop: 12,
    // borderWidth: 1,
    // borderColor: '#FFF'
  },
  addAccountText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 16,
    fontWeight: "600",
  },
});
