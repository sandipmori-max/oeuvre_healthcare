import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  gif: {
    width: 200,
    height: 200 
    },
  image: {
    width: 100,
    height: 100,
    marginBottom: 30,
    tintColor: '#FF6B6B',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
