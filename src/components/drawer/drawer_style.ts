import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor:'#251d50ff',
    borderTopRightRadius: 48,
    borderBottomLeftRadius: 48
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
  },
  itemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 6,
  },
  activeItemBackground: {
    backgroundColor: '#372C78ff',
    borderLeftWidth: 4,
    borderLeftColor: '#251d50ff',
    borderRadius: 8,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  logoutText: {
    fontWeight: 'bold',
  },
});
