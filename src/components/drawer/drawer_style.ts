import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    padding: 20,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
    backgroundColor: '#000',
  },
  username: {
    color: '#000',
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
    margin: 8
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
    marginVertical: 6
  },
  activeItemBackground: {
    backgroundColor: '#e6f0ff',
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    borderRadius: 8,
  },
  logoutButton: {
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  logoutText: {
    fontWeight: 'bold',
  }
});