import { Platform, StyleSheet } from 'react-native';
import { ERP_COLOR_CODE } from '../../../utils/constants';

export const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 40 : 10,
    flex: 1,
  },
  iconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    height: '100%',
  },
  back: {
    width: 24,
    height: 24,
    tintColor: ERP_COLOR_CODE.ERP_BLACK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1, 
    marginTop: Platform?.OS === 'android' ? 12 : 45
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: ERP_COLOR_CODE.ERP_BLACK,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  closeButtonText: {
    color: ERP_COLOR_CODE.ERP_BLACK,
    fontWeight: '600',
  },
  formContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: ERP_COLOR_CODE.ERP_555,
  },
  inputContainer: {
    marginBottom: 4,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    color: ERP_COLOR_CODE.ERP_444,
  },

  errorText: {
    color: ERP_COLOR_CODE.ERP_ERROR,
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 8,
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10, 
  },
  disabledButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    opacity: 0.4,
  },
  addButtonText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: ERP_COLOR_CODE.ERP_777,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 100,
    alignSelf: 'center',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
    borderRadius: 10,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    paddingHorizontal: 10,
  },

  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    padding: 14,
    borderRadius: 10,
  },
  input1: {
    marginLeft: 10,
    fontSize: 16,
    borderColor: ERP_COLOR_CODE.ERP_161515,
    paddingVertical: 14,
    flex: 1,
    borderRadius: 10,
  },
  toggleButton: {
    padding: 14,
  },
});
