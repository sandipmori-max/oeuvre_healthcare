import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import FastImage from "react-native-fast-image";

import { useAppSelector } from "../../store/hooks";
import {
  firstLetterUpperCase,
  handleEmailPress,
  handlePhonePress,
} from "../../utils/helpers";
import { ERP_DRAWER_LIST } from "../../constants";
import { styles } from "./drawer_style";
import { useBaseLink } from "../../hooks/useBaseLink";
import { DARK_COLOR, ERP_COLOR_CODE } from "../../utils/constants";
import ContactRow from "./ContactRow";
import ImageBottomSheetModal from "../bottomsheet/ImageBottomSheetModal";
import { useTranslation } from "react-i18next";
import TranslatedText from "../../screens/dashboard/tabs/home/TranslatedText";
import InAppReview from "react-native-in-app-review";
import AboutBottomSheet from "./AboutBottomSheet";
import { ERP_ICON } from "../../assets";

const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const navigation = useNavigation();
  const [showAbout, setShowAbout] = useState(false);
  const { t } = useTranslation();
  const drawerStatus = useDrawerStatus();
  const [showModal, setShowModal] = useState(false);
  const [img, setImg] = useState("");
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { user } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.theme.mode);
  const baseLink = useBaseLink();
  /* ================= SAFE CURRENT ROUTE ================= */
  const currentRoute = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route?.name;
  });

  /* ================= ANIMATION VALUES ================= */
  const menuAnim = useRef(
    ERP_DRAWER_LIST.map(() => new Animated.Value(-40)),
  ).current;

  const footerTranslateY = useRef(new Animated.Value(40)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  /* ================= HEADER ANIMATION ================= */
  const headerTranslateY = useRef(new Animated.Value(-60)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  /* ================= RUN ON EVERY DRAWER OPEN ================= */
  useEffect(() => {
    if (drawerStatus !== "open") return;

    // reset menu items
    menuAnim.forEach((anim) => anim.setValue(-40));

    // reset footer
    footerTranslateY.setValue(40);
    footerOpacity.setValue(0);

    // reset header
    headerTranslateY.setValue(-60);
    headerOpacity.setValue(0);

    // header animation (top → down)
    Animated.parallel([
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // menu animation (left → right)
    Animated.stagger(
      70,
      menuAnim.map((anim) =>
        Animated.timing(anim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ),
    ).start();

    // footer animation (bottom → up)
    Animated.parallel([
      Animated.timing(footerTranslateY, {
        toValue: 0,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [drawerStatus]);
  const [imageExists, setImageExists] = useState(true);

  const handleReview = async () => {
    try {
      if (InAppReview.isAvailable()) {
        await InAppReview.RequestInAppReview();
      } else {
        console.log("Not supported");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <DrawerContentScrollView
      showsVerticalScrollIndicator={false}
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme === "dark" ? DARK_COLOR : "white",
      }}
    >
      {/* ================= HEADER ================= */}
      <Animated.View
        style={{
          minWidth: "100%",
          transform: [{ translateY: headerTranslateY }],
          opacity: headerOpacity,
        }}
      >
        <View
          style={[
            styles.header,
            theme === "dark" && { backgroundColor: "black" },
          ]}
        >
          <View>
            <TouchableOpacity
              onPress={() => {
                if (!imageExists) {
                  return;
                }
                setImg(
                  `${baseLink}/FileUpload/1/UserMaster/${
                    user?.id
                  }/profileimage.jpeg?ts=${new Date().getTime()}`,
                );
                setShowModal(true);
              }}
            >
              <FastImage
                source={{
                  uri: `${baseLink}/FileUpload/1/UserMaster/${
                    user?.id
                  }/profileimage.jpeg?ts=${new Date().getTime()}`,
                  priority: FastImage.priority.normal,
                  cache: FastImage.cacheControl.web,
                }}
                style={styles.profileImage}
                onLoad={() => {
                  setImageExists(true);
                }}
                onError={() => {
                  setImageExists(false);
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={{ height: 28, width: 100 }} />

          <TranslatedText
            text={firstLetterUpperCase(user?.name || "")}
            numberOfLines={1}
            style={[styles.username, { top: 8, color: "#FFF" }]}
          ></TranslatedText>

          <View style={{ height: 8, width: 100 }} />

          <View style={{ top: 4, width: "100%", marginVertical: 1 }}>
            {user?.mobileno && (
              <TouchableOpacity
                onPress={() => {
                  handlePhonePress(user?.mobileno);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                }}
              >
                <MaterialIcons name="call" color="white" size={14} />
                <TranslatedText
                  text={user?.mobileno}
                  numberOfLines={1}
                  style={styles.userPhone}
                ></TranslatedText>
              </TouchableOpacity>
            )}

            {user?.emailid && (
              <TouchableOpacity
                onPress={() => {
                  handleEmailPress(user?.emailid);
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                }}
              >
                <MaterialIcons name="mail-outline" color="white" size={14} />
                <TranslatedText
                  text={user?.emailid}
                  numberOfLines={1}
                  style={styles.userPhone}
                ></TranslatedText>
              </TouchableOpacity>
            )}

            {user?.rolename && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  padding: 6,
                }}
              >
                <MaterialIcons name="person" color="white" size={14} />
                <TranslatedText
                  numberOfLines={1}
                  text={user?.rolename}
                  style={styles.userPhone}
                ></TranslatedText>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* ================= MENU ================= */}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={[
            !isLandscape && styles.menuContainer,
            {
              marginTop: isLandscape ? 45 : 5,
            },
          ]}
        >
          {ERP_DRAWER_LIST.map((item, index) => {
            const isActive = currentRoute === item.route;

            return (
              <Animated.View
                key={item.route}
                style={{ transform: [{ translateX: menuAnim[index] }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.drawerItem,
                    isActive && styles.activeItemBackground,
                    isActive &&
                      theme === "dark" && { backgroundColor: "black" },
                  ]}
                  onPress={() => {
                    if (item?.route === "AboutUs") {
                      setShowAbout(true);
                      return;
                    }
                    if (item?.route === "AppRatting") {
                      handleReview();
                      return;
                    }
                    if (item?.route === "Alert") {
                      props?.navigation.navigate("List", {
                        item: {
                          title: "Notification",
                          name: "Notification",
                          url: "DEVNOTIFY",
                          isFromBusinessCard: false,
                          isFromAlertCard: true,
                          id: "0",
                        },
                      });
                      props?.navigation.closeDrawer();
                      return;
                    }
                    if (item?.route === "List") {
                      props?.navigation.navigate("List", {
                        item: {
                          title: "Business Card",
                          name: "Business Card",
                          url: "BusinessCardMst",
                          isFromBusinessCard: true,
                          id: "0",
                        },
                      });
                      props?.navigation.closeDrawer();
                      return;
                    }
                    if (item?.route === "Attendance") {
                      // NativeModules.OrientationModule.enableLandscape();
                      props?.navigation.closeDrawer();
                      navigation.navigate(item?.route, { isFor: "Attendance" });
                      return;
                    }
                    if (item?.route === "MyAttendance") {
                      props?.navigation.closeDrawer();
                      navigation.navigate(item?.route, {
                        isFor: "MyAttendance",
                      });
                      return;
                    }
                    if (item?.route === "Home") {
                      props?.navigation.navigate("Home", { screen: "Home" });
                      props?.navigation.closeDrawer();
                      return;
                    } else {
                      props?.navigation.closeDrawer();
                      navigation.navigate(item?.route as never);
                    }
                  }}
                >
                  <View style={styles.itemRow}>
                    <MaterialIcons
                      name={item.icon}
                      size={20}
                      color={
                        theme === "dark"
                          ? "#FFF"
                          : isActive
                          ? "#FFF"
                          : ERP_COLOR_CODE.ERP_APP_COLOR
                      }
                    />
                    <TranslatedText
                      style={[
                        styles.itemLabel,
                        isActive && styles.activeText,
                        {
                          color:
                            theme === "dark"
                              ? "white"
                              : isActive
                              ? "#FFF"
                              : "#000",
                        },
                      ]}
                      numberOfLines={1}
                      text={item.label}
                    ></TranslatedText>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <ImageBottomSheetModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        imageUrl={img}
      />

      <AboutBottomSheet
        visible={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* ================= FOOTER ================= */}
      <Animated.View
        style={{
          transform: [{ translateY: footerTranslateY }],
          opacity: footerOpacity,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 0 }}>
          <Image
            source={{
              uri: `${baseLink}fileupload/1/InvoiceByConfig/1/logo.jpg`,
            }}
            style={{ height: 80, width: 80 }}
            resizeMode="contain"
          />
        </View>

        <View style={styles.logoutButton}>
          <Text
            style={[
              styles.logoutText,
              {
                fontSize: 12,
                color: ERP_COLOR_CODE.ERP_777,
              },
              theme === "dark" && { color: "white" },
            ]}
          >
            {t("test24")}
          </Text>
          <View style={{ flexDirection: "row" }}>
            <Image
              source={ERP_ICON.DEV_APP_LOGO}
              style={{
                height: 20,
                width: 20,
              }}
              resizeMode="contain"
            />
            <Text
              style={[
                styles.logoutText,
                theme === "dark" && { color: "white" },
                {
                  marginLeft: 8
                }
              ]}
            >
              (c) DevERP Solutions Pvt. Ltd.
            </Text>
          </View>

          {/* <ContactRow /> */}
        </View>
      </Animated.View>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
