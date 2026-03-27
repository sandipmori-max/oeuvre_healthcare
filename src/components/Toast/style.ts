import { Dimensions, StyleSheet } from "react-native";
import { ERP_COLOR_CODE } from "../../utils/constants";
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 1,
    alignSelf: 'center',
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    width: width ,
  },
  toastText: {
    color: ERP_COLOR_CODE.ERP_BLACK,
    fontSize: 16,
    textAlign: 'center',
  },
});
