import { StyleSheet } from 'react-native';
import { ERP_COLOR_CODE } from '../../utils/constants';

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    width: '100%',
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: {
    width: 80,
    height: 80,
  },
  loadingLineContainer: {
    position: "absolute",
    bottom: 80,
    height: 4,
    width: "90%",
    backgroundColor: "#eee",
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingLine: {
    height: "100%",
    backgroundColor: "#3498db",
  },
  loadingText: {
    position: "absolute",
    bottom: 40,
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  gif: {
    width: 120,
    height: 120,
    // borderRadius: 120,
  },  
  title: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '800',
    color:'black'
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },
});
