import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F8F9FA',
  },
   listContent: {
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeaderRow: {
    backgroundColor: '#eee',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    padding: 2,
    borderRightColor: '#ccc',
  },
  tableCell: {
    padding: 2,
    borderRightColor: '#ccc',
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
  },
 
  // Search styles
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6C757D',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },
  // Date picker styles
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateRow: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  // Date picker modal styles
  datePickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  datePickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  datePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  datePickerDay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  datePickerDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 2,
    marginBottom: 12,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    alignContent:'center',
    justifyContent:'center'
  },
  loadingText: {
    marginLeft: 8,
    color: '#6C757D',
  },
  errorText: {
    color: '#D9534F',
    marginBottom: 8,
  },
 
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leadIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  leadIconText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6C757D',
  },
  tooltipText: {
    marginTop: 4,
    fontSize: 12,
    color: '#6C757D',
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chipDate: {
    backgroundColor: '#E3F2FD',
  },
  chipDateText: {
    color: '#1976D2',
  },
  chipAmount: {
    backgroundColor: '#E8F5E8',
  },
  chipAmountText: {
    color: '#388E3C',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeActive: {
    backgroundColor: '#D1E7DD',
  },
  badgeTextActive: {
    color: '#0F5132',
  },
  badgeInactive: {
    backgroundColor: '#F8D7DA',
  },
  badgeTextInactive: {
    color: '#721C24',
  },
  metaContainer: {
    marginTop: 8,
  },
  metaText: {
    fontSize: 11,
    color: '#6C757D',
    marginBottom: 2,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 18,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

})