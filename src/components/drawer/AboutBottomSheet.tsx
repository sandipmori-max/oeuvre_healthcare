import MaterialIcons from "@react-native-vector-icons/material-icons";
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Linking,
  StyleSheet,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { ERP_COLOR_CODE } from "../../utils/constants";
import { ERP_ICON } from "../../assets";

const AboutBottomSheet = ({ visible, onClose }: any) => {
  const translateY = useRef(new Animated.Value(400)).current;
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  useEffect(() => {
    if (visible) {
      translateY.setValue(400);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const open = (url) => Linking.openURL(url);

  return (
    <Modal transparent visible={visible}  supportedOrientations={["portrait", "landscape"]} animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] },
        {
          height: height * 0.75
        }
    ]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Handle */}
          <View style={styles.handle} />

          {
            isLandscape ? <>
            <View style={{flexDirection:'row', height: height * 0.85}}>
              <View style={{width:'33%'}}>
          <View style={styles.headerWrapper}>
            {/* Close Icon */}
          
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                 <Image
                        source={ERP_ICON.DEV_APP_LOGO}
                        style={styles.logo}
                        resizeMode="contain"
                      />
              </View>

              <Text style={styles.title}>DevERP Solutions Pvt. Ltd.</Text>
              <Text style={styles.subtitle}>Business Automation & ERP</Text>
            </View>
          </View>

          {/* CONTACT */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("tel:+919327940159")}
            >
              <MaterialIcons name="call" size={20} color="green" />
              <Text style={styles.text}>+91 7935312554</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("mailto:support@deverp.com")}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={ERP_COLOR_CODE.ERP_ERROR}
              />
              <Text style={styles.text}>support@deverp.com</Text>
            </TouchableOpacity>
          </View>
              </View>

               <View style={[{width:'33%'}, 

                {
            marginTop: 40,
            marginHorizontal: 4
          }
               ]}>
 {/* ADDRESS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Address</Text>

            <View style={styles.row}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={ERP_COLOR_CODE.ERP_ERROR}
              />
              <Text style={styles.text}>
                405, 407B Primate Complex{"\n"}
                Opp. Gormoh Hotel, Bodakdev{"\n"}
                Ahmedabad - 380054, Gujarat
              </Text>
            </View>
          </View>

          {/* ONLINE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Online</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("https://www.deverp.com")}
            >
              <MaterialIcons name="language" size={20} color="blue" />
              <Text style={styles.text}>www.deverp.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("https://wa.me/919327940159")}
            >
              <MaterialIcons name="chat" size={20} color="#25D366" />
              <Text style={styles.text}>WhatsApp Chat</Text>
            </TouchableOpacity>
          </View>

         
              </View>

              <View style={[{width: '33%'}, ]}>
                  <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#333" />
            </TouchableOpacity>  
 {/* SOCIAL */}
          <View style={[styles.card, {
            marginTop: 40
          }]}>
            <Text style={styles.cardTitle}>Follow Us</Text>

            <View style={styles.socialGrid}>
              <TouchableOpacity
                onPress={() =>
                  open("https://www.facebook.com/DevERPSolutions#")
                }
                style={styles.socialItem}
              >
                <MaterialIcons name="facebook" size={22} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => open("https://x.com/DevERP5")}
                style={styles.socialItem}
              >
                <MaterialIcons name="alternate-email" size={22} color="#000" />
                <Text style={styles.socialText}>X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  open(
                    "https://www.linkedin.com/in/deverp-solutions-pvt-ltd-company-286598181",
                  )
                }
                style={styles.socialItem}
              >
                <MaterialIcons name="business" size={22} color="#0A66C2" />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  open("https://www.instagram.com/deverp001/?hl=en")
                }
                style={styles.socialItem}
              >
                <MaterialIcons name="photo-camera" size={22} color="#E1306C" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>
              </View>
            </View>
            
            </> : <>
            {/* HEADER */}
          <View style={styles.headerWrapper}>
            {/* Close Icon */}
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <MaterialIcons name="close" size={22} color="#333" />
            </TouchableOpacity>

            {/* Center Content */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                 <Image
                        source={ERP_ICON.DEV_APP_LOGO}
                        style={styles.logo}
                        resizeMode="contain"
                      />
              </View>

              <Text style={styles.title}>DevERP Solutions Pvt. Ltd.</Text>
              <Text style={styles.subtitle}>Business Automation & ERP</Text>
            </View>
          </View>

          {/* CONTACT */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("tel:+919327940159")}
            >
              <MaterialIcons name="call" size={20} color="green" />
              <Text style={styles.text}>+91 7935312554</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("mailto:support@deverp.com")}
            >
              <MaterialIcons
                name="email"
                size={20}
                color={ERP_COLOR_CODE.ERP_ERROR}
              />
              <Text style={styles.text}>support@deverp.com</Text>
            </TouchableOpacity>
          </View>

          {/* ADDRESS */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Address</Text>

            <View style={styles.row}>
              <MaterialIcons
                name="location-on"
                size={20}
                color={ERP_COLOR_CODE.ERP_ERROR}
              />
              <Text style={styles.text}>
                405, 407B Primate Complex{"\n"}
                Opp. Gormoh Hotel, Bodakdev{"\n"}
                Ahmedabad - 380054, Gujarat, India
              </Text>
            </View>
          </View>

          {/* ONLINE */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Online</Text>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("https://www.deverp.com")}
            >
              <MaterialIcons name="language" size={20} color="blue" />
              <Text style={styles.text}>www.deverp.com</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              onPress={() => open("https://wa.me/919327940159")}
            >
              <MaterialIcons name="chat" size={20} color="#25D366" />
              <Text style={styles.text}>WhatsApp Chat</Text>
            </TouchableOpacity>
          </View>

          {/* SOCIAL */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Follow Us</Text>

            <View style={styles.socialGrid}>
              <TouchableOpacity
                onPress={() =>
                  open("https://www.facebook.com/DevERPSolutions#")
                }
                style={styles.socialItem}
              >
                <MaterialIcons name="facebook" size={22} color="#1877F2" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => open("https://x.com/DevERP5")}
                style={styles.socialItem}
              >
                <MaterialIcons name="alternate-email" size={22} color="#000" />
                <Text style={styles.socialText}>X</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  open(
                    "https://www.linkedin.com/in/deverp-solutions-pvt-ltd-company-286598181",
                  )
                }
                style={styles.socialItem}
              >
                <MaterialIcons name="business" size={22} color="#0A66C2" />
                <Text style={styles.socialText}>LinkedIn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  open("https://www.instagram.com/deverp001/?hl=en")
                }
                style={styles.socialItem}
              >
                <MaterialIcons name="photo-camera" size={22} color="#E1306C" />
                <Text style={styles.socialText}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>
            </>
          }
          
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default AboutBottomSheet;
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 60,
  },
  headerWrapper: {
    marginBottom: 15,
  },

  closeIcon: {
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
    padding: 6,
  },

  header: {
    alignItems: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#f4f6f9",
    padding: 16,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  handle: {
    width: 50,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 12,
  },

  header: {
    alignItems: "center",
    marginBottom: 15,
  },

  logoCircle: {
    backgroundColor: "#007bff",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    marginTop: 8
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  subtitle: {
    fontSize: 12,
    color: "#666",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "black",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  text: {
    color: "#333",
    fontSize: 14,
  },

  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  socialItem: {
    width: "48%",
    backgroundColor: "#f8f9fb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  socialText: {
    marginTop: 5,
    fontSize: 12,
    color: "#555",
  },

  primaryBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 5,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
