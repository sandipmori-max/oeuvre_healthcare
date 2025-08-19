import { StyleSheet } from 'react-native';
import { ERP_COLOR_CODE } from '../../../utils/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ERP_COLOR_CODE.ERP_BACKGROUND,
  },
  back:{
    width: 24,
    height: 24,
    tintColor: ERP_COLOR_CODE.ERP_BLACK,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
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
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: ERP_COLOR_CODE.ERP_WHITE,
  },
  errorText: {
    color: '#d9534f',
    fontSize: 13,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: ERP_COLOR_CODE.ERP_ACTIVE_BUTTON,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  addButtonText: {
    color: ERP_COLOR_CODE.ERP_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 25,
    borderRadius: 20,
  },
});
