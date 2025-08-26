import { Dimensions, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginRight: 8 },
  backIcon: { fontSize: 20, color: '#222' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#222' },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  recordPunchTime: {
    fontSize: 14,
    color: '#555555ff',
    marginTop: 2,
  },

  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    top: 32,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    bottom: 52,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
  },
  selfyAvatar: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 14,
  },
  imageCol: { flex: 1, alignItems: 'center' },
  imageLabel: { marginTop: 6, fontSize: 12, color: '#666' },
  placeholderAvatar: { backgroundColor: '#e0e0e0' },
  formGroup: {
    marginBottom: 12,
  },
  formRow: { flexDirection: 'row' },
  label: { fontSize: 12, color: '#666', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
  },
  inputReadonly: {
    backgroundColor: '#F0F0F0',
    color: '#555',
  },
  errorText: { color: '#dc3545', fontSize: 12, marginTop: 4 },
  name: { fontSize: 17, fontWeight: 'bold' },
  email: { fontSize: 13, color: '#555' },
  phone: { fontSize: 13, color: '#888' },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: { fontSize: 12, color: '#666', marginTop: 6 },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
   },
  listSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },

  recordAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  recordName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
  },

  recordEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  recordDateTime: {
    fontSize: 12,
    color: '#000',
    marginTop: 2,
  },

  statusBadge: (status: 'checkin' | 'checkout') => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: status === 'checkin' ? '#28a745' : '#dc3545',
    alignSelf: 'flex-start',
  }),

  statusBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#696969ff',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
  },
  
});
