import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ERP_COLOR_CODE } from "../../utils/constants";

const TermsAndConsent = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);

  const handleContinue = async () => {
  if (!accepted) {
    Alert.alert(
      "Consent Required",
      "You must agree to the Terms & Conditions and Permissions before continuing."
    );
    return;
  }

  // Show permission alert
  Alert.alert(
    "Permissions Requested",
    "DevERP will now request access to background location, foreground service, and other necessary permissions."
  );

  // Save acceptance
  await AsyncStorage.setItem("TERMS_ACCEPTED", "true");

  onAccept(); // Continue to app
};

  // const handleContinue = () => {
  //   if (!accepted) {
  //     Alert.alert(
  //       "Consent Required",
  //       "You must agree to the Terms & Conditions and Permissions before continuing."
  //     );
  //     return;
  //   }

  //   // Trigger in-app permission requests after user consent
  //   Alert.alert(
  //     "Permissions Requested",
  //     "DevERP will now request access to background location, foreground service, and other necessary permissions."
  //   );

  //   onAccept(); // Move to the next step or screen
  // };

  const toggleCheckbox = () => setAccepted(!accepted);

  return (
  <>
    <View style={{height: 12}}/>
      <Text style={[styles.title, {
        borderBottomWidth: 0.4,
        paddingBottom: 4
      }]}>Terms & Conditions & Permissions Consent</Text>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      
      <Text style={styles.updated}>Last updated: December 10, 2025</Text>

      <Text style={styles.sectionTitle}>1. Introduction</Text>
      <Text style={styles.text}>
        Welcome to DevERP. These Terms & Conditions govern your use of our mobile application
        (“Service”). By using the Service, you agree to comply with these terms.
      </Text>

      <Text style={styles.sectionTitle}>2. Account</Text>
      <Text style={styles.text}>
        You may need to create an account to use certain features. You are responsible for your
        account credentials and all activity under your account.
      </Text>

      <Text style={styles.sectionTitle}>3. Permissions & Data Collection</Text>
      <Text style={styles.text}>
        DevERP requests permissions to provide app functionality. Each permission is used only
        with your explicit consent:
      </Text>

      <Text style={styles.subText}>• Location (Foreground & Background)</Text>
      <Text style={styles.text}>
        Background location is required to provide continuous tracking, geofencing, and
        navigation features. You will see a prominent disclosure explaining why this data is
        needed before permission is requested.
      </Text>

      <Text style={styles.subText}>• Foreground Service</Text>
      <Text style={styles.text}>
        Required to keep location tracking active when the app is in the background. A persistent
        notification will appear to indicate the service is running.
      </Text>

      <Text style={styles.subText}>• Storage / Media Access</Text>
      <Text style={styles.text}>
        Accessed only when you upload or attach files, photos, videos, or documents for app
        features. One-time or temporary access is used whenever possible.
      </Text>

      <Text style={styles.subText}>• Camera & Microphone</Text>
      <Text style={styles.text}>
        Used solely for capturing photos, scanning documents, or audio features. Access occurs
        only after your consent.
      </Text>

      <Text style={styles.subText}>• Notifications & Auto-Start</Text>
      <Text style={styles.text}>
        Used to provide alerts, reminders, updates, and to restart background services after
        device reboot, only if enabled by you.
      </Text>

      <Text style={styles.sectionTitle}>4. User Responsibilities</Text>
      <Text style={styles.text}>
        You agree to use the Service only for lawful purposes and not interfere with the app or
        servers.
      </Text>

      <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
      <Text style={styles.text}>
        Some features use third-party services (e.g., Google Places) that may collect data
        according to their privacy policies.
      </Text>

      <Text style={styles.sectionTitle}>6. Data Privacy</Text>
      <Text style={styles.text}>
        Personal data is collected, used, and shared as described in our Privacy Policy. Users
        can access, correct, or delete their data. Security measures are used, but complete
        protection cannot be guaranteed.
      </Text>

      <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
      <Text style={styles.text}>
        DevERP is provided “as is.” We are not liable for any damages from use, inability to
        use, or reliance on the app.
      </Text>

      <Text style={styles.sectionTitle}>8. Changes to Terms</Text>
      <Text style={styles.text}>
        We may update these Terms periodically. Users will be notified via the app or email.
      </Text>

      <Text style={styles.sectionTitle}>9. Governing Law</Text>
      <Text style={styles.text}>
        These Terms are governed by the laws of India. Disputes fall under Ahmedabad,
        Gujarat jurisdiction.
      </Text>

      <Text style={styles.sectionTitle}>10. Contact Us</Text>
      <Text style={styles.text}>
        Questions? Contact us at{" "}
        <Text style={{ color: 'blue' }}>http://deverp.com/index.aspx?q=aboutus</Text>.
      </Text>

     <View style={{paddingHorizontal: 12}}>
       {/* Custom Checkbox */}
      <TouchableOpacity style={styles.checkboxContainer} onPress={toggleCheckbox}>
        <View style={[styles.checkbox, accepted && styles.checkedBox]}>
          {accepted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxText}>
          I have read and agree to the Terms & Conditions and Permissions.
        </Text>
      </TouchableOpacity>

      {/* Continue Button */}
      { <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, !accepted && {
          backgroundColor:'gray'
        }]} onPress={() =>{
          if(accepted){
            handleContinue()
          }
        }}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
      }
    </View>
     
    </ScrollView>
    
  </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 15 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  updated: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 15, marginBottom: 5 },
  text: { fontSize: 14, marginBottom: 10, color: "#333", lineHeight: 20 },
  subText: { fontSize: 14, fontWeight: "600", marginBottom: 5, marginLeft: 10 },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginTop: 20 },
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
  checkboxText: { marginLeft: 10, fontSize: 14, color: "#333", flex: 1 },
  buttonContainer: { marginTop: 20, alignItems: "center",
    justifyContent:'center',
    alignContent:'center',
    width: '100%' },
  button: {
    backgroundColor: ERP_COLOR_CODE.ERP_APP_COLOR,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '100%',
    alignItems: "center",
     justifyContent:'center',
    alignContent:'center',
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default TermsAndConsent;
