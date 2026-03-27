import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
    borderRadius: 12,
    overflow: "hidden",
  },
  card: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 1,
    paddingHorizontal: 2,
    marginBottom: 12,
    alignItems: "center",
    marginHorizontal: 6,
  },
  cardV2: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  iconContainer: {
    marginTop: 6,
    width: 40,
    height: 40,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(107, 104, 104, 0.3)",
  },
  iconContainerV2: {
    width: 36,
    height: 36,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(107, 104, 104, 0.3)",
  },
  iconText: {
    opacity: 0.5,
    fontSize: 20,
    fontWeight: "700",
  },
  iconTextV2: {
    opacity: 0.5,
    fontSize: 18,
    fontWeight: "400",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    textAlign: "center",
  },
  titleV2: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 4,
    color: "rgba(75, 73, 73, 0.85)",
  },
  subtitleV2: {
    fontSize: 12,
    color: "rgba(75, 73, 73, 0.85)",
  },
});