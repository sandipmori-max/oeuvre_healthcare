import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  bottomContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  sheet: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  desc: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginVertical: 10,
  },

  updateBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  updateText: {
    color: "#fff",
    fontWeight: "600",
  },

  skipText: {
    textAlign: "center",
    marginTop: 15,
    color: "#888",
  },
});