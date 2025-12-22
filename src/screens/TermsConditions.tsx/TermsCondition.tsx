import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERP_COLOR_CODE } from "../../utils/constants";

const TermsAndConsent = ({ onAccept }: any) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleTermsContinue = () => {
    if (!termsAccepted) {
      Alert.alert(
        "Consent Required",
        "You must agree to the Terms & Conditions before continuing."
      );
      return;
    }
    setShowLocationModal(true);
  };

  const handleLocationAgree = async () => {
    await AsyncStorage.setItem("TERMS_ACCEPTED", "true");
    await AsyncStorage.setItem("LOCATION_DISCLOSURE_ACCEPTED", "true");
    setShowLocationModal(false);
    onAccept();
  };

  return (
    <>
      <View style={{ height: 12 }} />
      <Text
        style={[
          styles.title,
          { borderBottomWidth: 0.4, paddingBottom: 4 },
        ]}
      >
        Terms & Conditions & Permissions Consent
      </Text>

      {/* TERMS & CONDITIONS (UNCHANGED STRUCTURE) */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        <Text style={styles.updated}>
          Last updated: December 10, 2025
        </Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to DevERP. These Terms & Conditions govern your use of our mobile
          application (“Service”).
        </Text>

        <Text style={styles.sectionTitle}>2. Account</Text>
        <Text style={styles.text}>
          You are responsible for your account credentials and all activity under
          your account.
        </Text>

        <Text style={styles.sectionTitle}>
          3. Permissions & Data Collection
        </Text>
        <Text style={styles.text}>
          DevERP requests certain permissions only to provide requested app
          functionality.
        </Text>

        {/* ✅ LOCATION – FOREGROUND ONLY */}
        <Text style={styles.subText}>
          • Location (While App Is In Use)
        </Text>
        <Text style={styles.text}>
          Location access is used only while you are actively using the app to
          fetch your current location for location-based features.
        </Text>

        <Text style={styles.subText}>• Storage / Media Access</Text>
        <Text style={styles.text}>
          Used only when you upload or attach files such as photos, videos, or
          documents.
        </Text>

        <Text style={styles.subText}>• Camera & Microphone</Text>
        <Text style={styles.text}>
          Used only when you choose to capture photos or use audio features.
        </Text>

        <Text style={styles.subText}>• Notifications</Text>
        <Text style={styles.text}>
          Used to provide alerts and updates if enabled by you.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Privacy</Text>
        <Text style={styles.text}>
          Personal data is handled according to our Privacy Policy.
        </Text>

        <Text style={styles.sectionTitle}>5. Governing Law</Text>
        <Text style={styles.text}>
          These Terms are governed by the laws of India.
        </Text>

        {/* TERMS CHECKBOX */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View
            style={[
              styles.checkbox,
              termsAccepted && styles.checkedBox,
            ]}
          >
            {termsAccepted && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </View>
          <Text style={styles.checkboxText}>
            I have read and agree to the Terms & Conditions.
          </Text>
        </TouchableOpacity>

        {/* CONTINUE */}
        <TouchableOpacity
          style={[
            styles.button,
            !termsAccepted && { backgroundColor: "gray" },
          ]}
          onPress={handleTermsContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* LOCATION DISCLOSURE MODAL (FOREGROUND ONLY) */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Location Data Usage Disclosure
            </Text>

            <Text style={styles.modalText}>
              DevERP collects and uses your current location only while you are
              actively using the app.
            </Text>

            <Text style={styles.modalText}>
              Location access stops when the app is closed or not in use.
            </Text>

            <Text style={styles.modalText}>
              Your location data is used only for app functionality and is not
              sold or shared for advertising purposes.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowLocationModal(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.allowBtn]}
                onPress={handleLocationAgree}
              >
                <Text style={styles.allowText}>
                  Agree & Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  subText: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  updated: { fontSize: 14, color: "#555", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 15 },
  text: { fontSize: 14, color: "#333", marginTop: 6 },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#555",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkedBox: { backgroundColor: "#3498db", borderColor: "#3498db" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  checkboxText: { marginLeft: 10, fontSize: 14, flex: 1 },

  button: {
    marginTop: 25,
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 8, color: "#333" },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 15,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelBtn: { backgroundColor: "#e0e0e0" },
  allowBtn: { backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR },
  cancelText: { color: "#333", fontWeight: "600" },
  allowText: { color: "#fff", fontWeight: "600" },
});

export default TermsAndConsent;
