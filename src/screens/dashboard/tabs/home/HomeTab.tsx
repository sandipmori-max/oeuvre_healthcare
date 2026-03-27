import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { styles } from "./home_style";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import FullViewLoader from "../../../../components/loader/FullViewLoader";
import NoData from "../../../../components/no_data/NoData";
import ERPIcon from "../../../../components/icon/ERPIcon";
import {
  getERPAppConfigMenuThunk,
  getERPDashboardThunk,
  getERPMenuThunk,
  getERPPageThunk,
} from "../../../../store/slices/auth/thunk";
import ErrorMessage from "../../../../components/error/Error";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import Footer from "./Footer";
import PieChartSection from "./chartData";

import {
  formatDateForAPI,
  getDashboardAI,
  parseCustomDate,
} from "../../../../utils/helpers";
import DateTimePicker from "@react-native-community/datetimepicker";

import CustomPicker from "../../page/components/CustomPicker";
import {
  setActiveDashboardBranch,
  setActiveDashboardBranchId,
  setActiveDashboardFromDate,
  setActiveDashboardToDate,
  setActiveDashboardType,
  setActiveDashboardTypeId,
  setDashboardLoading,
} from "../../../../store/slices/auth/authSlice";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Animated,
  TextInput,
  Alert,
  Modal,
  Platform,
  Image,
  useWindowDimensions,
} from "react-native";
import TranslatedText from "./TranslatedText";
import GreetingBottomSheet from "./GreetingBottomSheet";
import { ERP_ICON } from "../../../../assets";

const hasHtmlContent = (str: string) => {
  if (!str || typeof str !== "string") return false;
  return /<([a-z]+)([^>]*?)>/i.test(str);
};

const HomeScreen = ({ setHideTab, hideTab }) => {
  const { height, width } = useWindowDimensions();
  const isLandscape = width > height;
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const [controls, setControls] = useState<any[]>([]);
  const [controlsLoader, setControlsLoader] = useState<any>(false);

  const [aiMessage, setAiMessage] = useState("");
  const [visibleAI, setVisibleAI] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const {
    dashboard,
    isDashboardLoading,
    isAuthenticated,
    error,
    user,
    attendanceDone,
  } = useAppSelector((state) => state.auth);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showFull ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showFull]);

  const runAI = async () => {
    try {
      const message = await getDashboardAI(dashboard);

      if (!message) return;
      setAiMessage(message);
      setVisibleAI(true);
    } catch (e) {
      if (e?.message?.includes("Quota")) {
        setTimeout(() => {
          runAI();
        }, 60000);
      }
    }
  };

  const aiCalled = useRef(false);

  useEffect(() => {
    if (!dashboard || aiCalled.current) return;
    const timer = setTimeout(() => {
      runAI();
      aiCalled.current = true;
    }, 19000);

    return () => clearTimeout(timer);
  }, [dashboard]);
  const [loadingPageId, setLoadingPageId] = useState<any>(null);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const auth = useAppSelector((state) => state?.auth);

  const [showDatePicker, setShowDatePicker] = useState<null | {
    type: "from" | "to";
    show: boolean;
  }>(null);

  const [visible, setVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const theme = useAppSelector((state) => state?.theme.mode);
  const [actionLoader, setActionLoader] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredDashboard, setFilteredDashboard] = useState(dashboard);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const translateX = useRef(new Animated.Value(width)).current;

  const htmlItems = filteredDashboard.filter((item) =>
    hasHtmlContent(item.data),
  );
  const emptyItems = filteredDashboard.filter((item) => item?.data === "");

  const textItems = filteredDashboard.filter(
    (item) => item.data && !hasHtmlContent(item.data),
  );

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      const filtered = dashboard.filter((item) => {
        const text = searchText?.toLowerCase();
        return (
          (item?.name || "").toLowerCase().includes(text) ||
          (item?.title || "").toLowerCase().includes(text) ||
          (item?.data || "").toLowerCase().includes(text)
        );
      });

      setFilteredDashboard(filtered);
    }, 300);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchText, dashboard]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setActiveDashboardBranchId(""));
      dispatch(setActiveDashboardBranch(""));
      dispatch(setActiveDashboardType(""));
      dispatch(setActiveDashboardTypeId(""));
      setIsFilterVisible(false);
      setIsHorizontal(false);
      return () => {};
    }, [isAuthenticated, navigation]),
  );
  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -350,
        duration: 10000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
      },
      headerBackTitle: "",
      headerTintColor: "#fff",
      headerTitle: () =>
        showSearch ? (
          <View
            style={{
              width: width - 70,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
              placeholder={t("text83")}
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                borderRadius: 8,
                paddingHorizontal: 12,
                height: 36,
              }}
            />
            <TouchableOpacity
              onPress={() => {
                setShowSearch(false);
                setSearchText("");
              }}
            >
              <MaterialIcons
                name="clear"
                size={24}
                color={ERP_COLOR_CODE.ERP_WHITE}
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
                  numberOfLines={1}
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "600",
                  }}
                >
                  {t("text84")}
                </Text>
          </>
        ),
      headerRight: () =>
        !showSearch && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* ✅ ANIMATED ICONS */}
            <Animated.View
              style={{
                flexDirection: "row",
                alignItems: "center",
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              }}
            >
              {showFull && (
                <>

                  <ERPIcon
                    name={!isHorizontal ? "list" : "apps"}
                    onPress={() => setIsHorizontal((prev) => !prev)}
                  />

                  <ERPIcon
                    name={isFilterVisible ? "close" : "filter-alt"}
                    onPress={() => setIsFilterVisible((prev) => !prev)}
                  />

                  <ERPIcon
                    name={!hideTab ? "fullscreen" : "fullscreen-exit"}
                    onPress={() => {
                      setHideTab(!hideTab);
                    }}
                  />
                </>
              )}
            </Animated.View>
            <ERPIcon
                    name="refresh"
                    onPress={() => {
                      setControlsLoader(true);
                      setActionLoader(true);
                      setIsRefresh(!isRefresh);
                      dispatch(getERPAppConfigMenuThunk());
                      getCurrentMonthRange()
                      dispatch(setActiveDashboardBranchId(""));
                            dispatch(setActiveDashboardBranch(""));
                            dispatch(setActiveDashboardType(""));
                            dispatch(setActiveDashboardTypeId(""));
                     const params = { branch: "", type: "", fd: "", td: "" };
                      dispatch(getERPDashboardThunk(params));

                      const timer = setTimeout(() => {
                        setActionLoader(false);
                        setControlsLoader(false);
                        dispatch(setDashboardLoading(false));
                      }, 3000);

                      return () => clearTimeout(timer);
                    }}
                    isLoading={actionLoader}
            />

            {dashboard.length > 5 && (
                    <ERPIcon
                      name="search"
                      onPress={() => setShowSearch(true)}
                    />
                  )}

            {attendanceDone && (
              <ERPIcon
                color={"green"}
                name={"location-on"}
                onPress={() => {
                  navigation.navigate("LocationTrack");
                }}
              />
            )}
            <ERPIcon
              name={!showFull ? "more-vert" : "close"}
              onPress={() => {
                setIsFilterVisible(false);
                setShowFull(!showFull);
              }}
            />
          </View>
        ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation?.openDrawer()}
          style={{
            height: 46,
            width: 46,
            justifyContent: "center",
            alignContent: "center",
            alignItems: "center",
          }}
        >
          <ERPIcon
            extSize={24}
            isMenu={true}
            name="menu"
            onPress={() => navigation?.openDrawer()}
          />
        </TouchableOpacity>
      ),
    });
  }, [
    showFull,
    actionLoader,
    attendanceDone,
    navigation,
    isHorizontal,
    isRefresh,
    showSearch,
    dashboard,
    searchText,
    filteredDashboard,
    isFilterVisible,
    hideTab,
  ]);

  useFocusEffect(
    useCallback(() => {
      let timer;

      if (isAuthenticated) {
        setLoadingPageId(true);
        dispatch(getERPAppConfigMenuThunk());
        const params = { branch: "", type: "", fd: "", td: "" };
        dispatch(getERPDashboardThunk(params));
        dispatch(getERPMenuThunk());
        timer = setTimeout(() => {
          dispatch(setDashboardLoading(false));
        }, 3000);
      }
      // ✅ single cleanup function
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
      };
    }, [isAuthenticated, dispatch]),
  );

  const accentColors = [
    "#4C6FFF",
    "#00C2A8",
    "#FFB020",
    "#FF6B6B",
    "#9B59B6",
    "#20C997",
  ];

  const pieChartData = filteredDashboard
    .filter((item) => {
      const num = Number(item?.data);
      return (
        item?.title !== "Attendance Code" &&
        item?.data !== "" &&
        !isNaN(num) &&
        num > 0
      );
    })
    .map((item, index) => ({
      value: Number(item?.data),
      color: accentColors[index % accentColors.length],
      text: item?.title,
    }));

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderDashboardItem = ({
    item,
    index,
    isFromHtml,
    isFromMenu,
  }: any) => {
    return (
      <TouchableOpacity 
        style={[
          styles.dashboardItem,
          {
            paddingLeft: 4,
            marginHorizontal: 4,
            borderRadius: 8,
            width: isFromHtml ? "100%" : isHorizontal ? "100%" : "48%",
            flex: 1,
            borderLeftColor: accentColors[index % accentColors.length],
            borderWidth: 1,
            borderLeftWidth: 3,
            backgroundColor: theme === "dark" ? "black" : "white",
          },
        ]}
        activeOpacity={0.7}
        onPress={async () => {
          if (
            item?.url.includes(".") ||
            item?.url.includes("?") ||
            item?.url.includes("/")
          ) {
            navigation.navigate("Web", { item });
          } else {
            navigation.navigate("List", { item });
          }
        }}
      >
        <View
          style={{
            backgroundColor:
              theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_WHITE,
            borderRadius: 8,
          }}
        >
          <View style={styles.dashboardItemContent}>
            <View style={styles.dashboardItemHeader}>
              <View style={styles.dashboardItemTopRow}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        accentColors[index % accentColors.length],
                    },
                  ]}
                >
                  <MaterialIcons
                    name={item?.image || "widgets"}
                    color={"white"}
                    size={18}
                  />
                  {/* <Text style={styles.iconText}>{getInitials(item?.name)}</Text> */}
                </View>
                <View style={styles.headerTextWrap}>
                  {/* <Text
                    style={[
                      styles.dashboardItemText,
                      {
                        color:
                          theme === 'dark' ? 'white' : ERP_COLOR_CODE.ERP_BLACK,
                        flexShrink: 1,
                        includeFontPadding: false,
                        textAlignVertical: 'top',
                      },
                    ]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {isFromMenu
                      ?  translateSingle(item?.title) 
                      : !isHorizontal
                        ? item?.title.replace(' ', '\n')
                        : translateSingle(item?.title)}
                  </Text> */}
                  <TranslatedText
                    text={item?.title}
                    style={[
                      styles.dashboardItemText,
                      {
                        color:
                          theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_BLACK,
                        flexShrink: 1,
                        includeFontPadding: false,
                        textAlignVertical: "top",
                      },
                    ]}
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>

            <View style={{ marginVertical: item.data ? 4 : 0 }}>
              {loadingPageId === (item.id || String(index)) && (
                <View
                  style={{
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator
                    size="small"
                    color={ERP_COLOR_CODE.ERP_007AFF}
                  />
                  <Text
                    style={{ marginLeft: 8, color: ERP_COLOR_CODE.ERP_6C757D }}
                  >
                    {t("text85")}
                  </Text>
                </View>
              )}
              {item.data ? (
                <View style={styles.dataContainer}>
                  <Footer
                    textColor={accentColors[index % accentColors.length]}
                    isFromMenu={isFromMenu}
                    isHorizontal={isHorizontal}
                    footer={item?.data}
                    index={index}
                    accentColors={accentColors}
                    isFromListPage={undefined}
                  />
                </View>
              ) : (
                <View style={styles.dataContainer}>
                  <Text style={styles.dashboardItemData} numberOfLines={2}>
                    {"-"}
                  </Text>
                </View>
              )}
            </View>
            {item?.footer ? (
              <View style={{ marginTop: 1 }}>
                <Footer
                  textColor={accentColors[index % accentColors.length]}
                  isFromMenu={isFromMenu}
                  isHorizontal={isHorizontal}
                  footer={item?.footer}
                  index={index}
                  accentColors={accentColors}
                  isFromListPage={undefined}
                />
              </View>
            ) : (
              <Text
                style={{
                  color: accentColors[index % accentColors.length],
                }}
              >
                {"-"}
              </Text>
            )}
            {item?.footer || item.data ? (
              <> </>
            ) : (
              <View
                style={{ height: 12, width: 12, backgroundColor: "" }}
              ></View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const scrollY = useRef(new Animated.Value(0)).current;

  const getCurrentMonthRange = useCallback(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date();
    const fromDateStr = formatDateForAPI(firstDay);
    const toDateStr = formatDateForAPI(lastDay);
    setFromDate(fromDateStr);
    setToDate(toDateStr);
    return { fromDate: fromDateStr, toDate: toDateStr };
  }, []);

  useEffect(() => {
    const { fromDate: initialFromDate, toDate: initialToDate } =
      getCurrentMonthRange();
  }, [getCurrentMonthRange]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event?.type === "dismissed" || !selectedDate) {
      setShowDatePicker(null);
      return;
    }
    const { type } = showDatePicker!;
    const formattedDate = formatDateForAPI(selectedDate);

    if (type === "to") {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (fromDate) {
        const fromDateObj = new Date(fromDate.split("-").reverse().join("-"));
        if (selectedDate < fromDateObj) {
          Alert.alert(t("text86"), t("text87"), [{ text: t("text88") }]);
          setShowDatePicker(null);
          return;
        }
      }
      setToDate(formattedDate);
      dispatch(setActiveDashboardToDate(formattedDate));
    } else {
      setFromDate(formattedDate);
      dispatch(setActiveDashboardFromDate(formattedDate));
      if (toDate) {
        const toDateObj = new Date(toDate.split("-").reverse().join("-"));
        if (selectedDate > toDateObj) {
          setToDate("");
        }
      }
    }
    setShowDatePicker(null);
  };

  const fetchPageData = useCallback(async () => {
    try {
      setControlsLoader(true);
      const parsed = await dispatch(
        getERPPageThunk({ page: "Dashboard", id: "" }),
      ).unwrap();
      const pageControls = Array.isArray(parsed?.pagectl)
        ? parsed?.pagectl
        : [];
      const normalizedControls = pageControls?.map((c) => ({
        ...c,
        disabled: String(c?.disabled ?? "0"),
        visible: String(c?.visible ?? "1"),
        mandatory: String(c?.mandatory ?? "0"),
      }));
      setControls(normalizedControls);
      setControlsLoader(false);
    } catch (e: any) {
    } finally {
      setLoadingPageId(null);
      setTimeout(() => {
        setActionLoader(false);
      }, 10);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchPageData();
  }, []);

  useEffect(() => {
    dispatch(
      getERPDashboardThunk({
        branch: auth?.dashboardBranchId.trim() || "",
        type: auth?.dashboardTypeId.trim() || "",
        fd: auth?.dashboardFromDate.trim() || "",
        td: auth?.dashboardToDate.trim() || "",
      }),
    );
    const timer = setTimeout(() => {
      dispatch(setDashboardLoading(false));
    }, 3000);
    return () => clearTimeout(timer);
  }, [
    auth.dashboardBranch,
    auth.dashboardType,
    auth.dashboardFromDate,
    auth.dashboardToDate,
  ]);

  if (isDashboardLoading)
    return <FullViewLoader isShowTop={theme === "dark" ? false : true} />;
  if (!actionLoader && filteredDashboard?.length === 0) {
    return (
      <View
        style={{
          justifyContent: "center",

          // height: Dimensions.get("screen").height,
          backgroundColor: theme === "dark" ? "black" : "white",
        }}
      >
        <View
          style={{
            height: Dimensions.get("screen").height * 0.75,
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            backgroundColor: theme === "dark" ? "black" : "white",
          }}
        >
          <View
            style={{
              backgroundColor:
                theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
              padding: 12,
              width: width,
              borderBottomRightRadius: 24,
              borderBottomLeftRadius: 24,
              borderColor: "white",
              // width: "100%",
              alignItems: "center",
              alignContent: "center",
              marginBottom: 10,
            }}
          >
            {showFull && (
              <Animated.View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  alignContent: "center",
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 0],
                      }),
                    },
                    {
                      scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                }}
              >
                <MaterialIcons name="business" size={24} color={"#FFF"} />
                <Text
                  numberOfLines={1}
                  style={{
                    color: "#FFF",
                    fontWeight: "600",
                    fontSize: 16,
                    maxWidth: 280,
                    marginLeft: 8,
                  }}
                >
                  {user?.companyName || ""}
                </Text>
              </Animated.View>
            )}

            {/* Branch + Type Buttons */}
            {isFilterVisible && (
              <>
                <View
                  style={[
                    styles.dateContainer,
                    {
                      marginTop: 8,
                    },
                  ]}
                >
                  {/* Dynamic Render Date Fields */}
                  {isFilterVisible &&
                    controls
                      .filter((x) => x.ctltype === "DATE")
                      .map((item, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dateRow,
                            {
                              width: "48%",
                            },
                          ]}
                        >
                          <TouchableOpacity
                            onPress={() =>
                              setShowDatePicker({
                                type: item.field === "fromdate" ? "from" : "to",
                                show: true,
                              })
                            }
                            style={[
                              styles.dateButton,
                              {
                                width: "98%",
                              },
                            ]}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                              }}
                            >
                              <MaterialIcons
                                name="calendar-today"
                                size={18}
                                color="#fff"
                                style={{ marginRight: 8 }}
                              />
                              <Text
                                style={[
                                  styles.dateButtonText,
                                  { color: "#FFF" },
                                ]}
                              >
                                {item.field === "fromdate"
                                  ? fromDate || "Select From Date"
                                  : toDate || "Select To Date"}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          {index === 0 && (
                            <View style={{ height: 1, width: 8 }} />
                          )}
                        </View>
                      ))}
                </View>

                {isFilterVisible && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginTop: 4,
                    }}
                  >
                    {controls
                      .filter(
                        (x) => x.ctltype !== "DATE" && x.field !== "userid",
                      )
                      .map((item, index) => (
                        <>
                          <View style={{ width: "49.5%" }}>
                            <CustomPicker
                              isForceOpen={false}
                              isValidate={false}
                              label={item.title}
                              selectedValue={() => {}}
                              dtext={
                                item?.title === "Branch"
                                  ? auth?.dashboardBranch || item.dtext
                                  : auth.dashboardType || item?.dtext
                              }
                              onValueChange={(i) => {
                                if (item?.title === "Branch") {
                                  dispatch(
                                    setActiveDashboardBranchId(
                                      i?.value?.toString(),
                                    ),
                                  );
                                  dispatch(setActiveDashboardBranch(i?.name));
                                } else {
                                  dispatch(setActiveDashboardType(i?.name));
                                  dispatch(
                                    setActiveDashboardTypeId(
                                      i?.value?.toString(),
                                    ),
                                  );
                                }
                                setIsFilterVisible(false);
                              }}
                              options={[]}
                              item={item}
                              errors={null}
                              formValues={null}
                            />
                          </View>
                        </>
                      ))}
                  </View>
                )}
              </>
            )}
            {showDatePicker?.show && Platform.OS === "ios" && (
              <Modal
                transparent
                animationType="slide"
                supportedOrientations={["portrait", "landscape"]}
                statusBarTranslucent
              >
                <View
                  style={[
                    styles.overlay,
                    isLandscape && {
                      alignContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.sheet,
                      theme === "dark" && {
                        borderWidth: 1,
                        borderColor: "white",
                      },
                      {
                        width: isLandscape ? "50%" : "100%",
                      },
                    ]}
                  >
                    {/* Divider */}
                    <View
                      style={[
                        theme === "dark" && {
                          overflow: "hidden",
                          borderColor: "white",
                        },
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                          padding: 12,
                          alignContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme === "dark" ? "white" : "black",
                        }}
                      >
                        {t("text89")}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          setShowDatePicker(null);
                        }}
                      >
                        <MaterialIcons name="close" color={"black"} size={24} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.divider} />

                    {/* Date Picker */}
                    <DateTimePicker
                      value={
                        showDatePicker.type === "from" && fromDate
                          ? parseCustomDate(fromDate)
                          : showDatePicker.type === "to" && toDate
                          ? parseCustomDate(toDate)
                          : new Date()
                      }
                      themeVariant="light"
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                    />
                  </View>
                </View>
              </Modal>
            )}

            {/* Date Picker */}
            {Platform.OS !== "ios" && showDatePicker?.show && (
              <DateTimePicker
                value={
                  showDatePicker.type === "from" && fromDate
                    ? parseCustomDate(fromDate)
                    : showDatePicker.type === "to" && toDate
                    ? parseCustomDate(toDate)
                    : new Date()
                }
                mode="date"
                onChange={handleDateChange}
              />
            )}
          </View>

          <NoData isShowTop={false} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        height: Dimensions.get("screen").height,
        flex: 1,
        backgroundColor: isDashboardLoading
          ? "black"
          : theme === "dark"
          ? "black"
          : "white",
      }}
    >
      <View
        style={{
          backgroundColor:
            theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
          padding: !showFull ? 2 : !hideTab ? 12 : 2,
          borderBottomRightRadius: 8,
          borderBottomLeftRadius: 8,
        }}
      >
        {showFull && !hideTab && (
          <Animated.View
            style={{
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
              gap: 8,
              flexDirection: "row",
              // transform: [{ translateX }],
            }}
          >
            <MaterialIcons name="business" size={24} color={"#FFF"} />
            <TranslatedText
              numberOfLines={1}
              style={{
                color: "#FFF",
                fontWeight: "600",
                fontSize: 16,
                maxWidth: 280,
              }}
              text={user?.companyName || ""}
            ></TranslatedText>
          </Animated.View>
        )}
        {isLandscape && isFilterVisible && (
          <View style={{ flexDirection: "row" }}>
            <View
              style={[
                styles.dateContainer,
                {
                  marginTop: 8,
                  marginHorizontal: 4,
                },
                {
                  width: "50%",
                },
              ]}
            >
              {isFilterVisible &&
                controls
                  .filter((x) => x.ctltype === "DATE")
                  .map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dateRow,
                        {
                          width: "48%",
                        },
                      ]}
                    >
                      <Text style={{ marginBottom: 12, color: "white" }}>
                        {item?.field}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setShowDatePicker({
                            type: item.field === "fromdate" ? "from" : "to",
                            show: true,
                          })
                        }
                        style={[
                          styles.dateButton,
                          {
                            width: "98%",
                          },
                        ]}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialIcons
                            name="calendar-today"
                            size={18}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <TranslatedText
                            numberOfLines={1}
                            text={
                              item.field === "fromdate"
                                ? fromDate || "Select From Date"
                                : toDate || "Select To Date"
                            }
                            style={[styles.dateButtonText, { color: "#FFF" }]}
                          ></TranslatedText>
                        </View>
                      </TouchableOpacity>
                      {index === 0 && <View style={{ height: 1, width: 8 }} />}
                    </View>
                  ))}
            </View>
            <View
              style={{
                width: "50%",
              }}
            >
              {isLandscape && isFilterVisible && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 4,
                    marginHorizontal: 4,
                  }}
                >
                  {controls
                    .filter((x) => x.ctltype !== "DATE" && x.field !== "userid")
                    .map((item, index) => (
                      <>
                        <View style={{ width: "49.5%" }}>
                          <CustomPicker
                            isForceOpen={false}
                            isValidate={false}
                            label={item.title}
                            selectedValue={() => {}}
                            dtext={
                              item?.title === "Branch"
                                ? auth?.dashboardBranch || item.dtext
                                : auth.dashboardType || item?.dtext
                            }
                            onValueChange={(i) => {
                              if (item?.title === "Branch") {
                                dispatch(
                                  setActiveDashboardBranchId(
                                    i?.value?.toString(),
                                  ),
                                );
                                dispatch(setActiveDashboardBranch(i?.name));
                              } else {
                                dispatch(setActiveDashboardType(i?.name));
                                dispatch(
                                  setActiveDashboardTypeId(
                                    i?.value?.toString(),
                                  ),
                                );
                              }
                            }}
                            options={[]}
                            item={item}
                            errors={null}
                            formValues={null}
                          />
                        </View>
                      </>
                    ))}
                </View>
              )}
            </View>
          </View>
        )}
        {!isLandscape && isFilterVisible && (
          <>
            <View
              style={[
                styles.dateContainer,
                {
                  marginTop: 8,
                  marginHorizontal: 4,
                },
              ]}
            >
              {isFilterVisible &&
                controls
                  .filter((x) => x.ctltype === "DATE")
                  .map((item, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dateRow,
                        {
                          width: "48%",
                        },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setShowDatePicker({
                            type: item.field === "fromdate" ? "from" : "to",
                            show: true,
                          })
                        }
                        style={[
                          styles.dateButton,
                          {
                            width: "98%",
                          },
                        ]}
                      >
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <MaterialIcons
                            name="calendar-today"
                            size={18}
                            color="#fff"
                            style={{ marginRight: 8 }}
                          />
                          <TranslatedText
                            numberOfLines={1}
                            text={
                              item.field === "fromdate"
                                ? fromDate || "Select From Date"
                                : toDate || "Select To Date"
                            }
                            style={[styles.dateButtonText, { color: "#FFF" }]}
                          ></TranslatedText>
                        </View>
                      </TouchableOpacity>
                      {index === 0 && <View style={{ height: 1, width: 8 }} />}
                    </View>
                  ))}
            </View>

            {!isLandscape && isFilterVisible && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 4,
                  marginHorizontal: 4,
                }}
              >
                {controls
                  .filter((x) => x.ctltype !== "DATE" && x.field !== "userid")
                  .map((item, index) => (
                    <>
                      <View style={{ width: "49.5%" }}>
                        <CustomPicker
                          isForceOpen={false}
                          isValidate={false}
                          label={item.title}
                          selectedValue={() => {}}
                          dtext={
                            item?.title === "Branch"
                              ? auth?.dashboardBranch || item.dtext
                              : auth.dashboardType || item?.dtext
                          }
                          onValueChange={(i) => {
                            if (item?.title === "Branch") {
                              dispatch(
                                setActiveDashboardBranchId(
                                  i?.value?.toString(),
                                ),
                              );
                              dispatch(setActiveDashboardBranch(i?.name));
                            } else {
                              dispatch(setActiveDashboardType(i?.name));
                              dispatch(
                                setActiveDashboardTypeId(i?.value?.toString()),
                              );
                            }
                          }}
                          options={[]}
                          item={item}
                          errors={null}
                          formValues={null}
                        />
                      </View>
                    </>
                  ))}
              </View>
            )}
          </>
        )}

        {showDatePicker?.show && Platform.OS === "ios" && (
          <Modal
            transparent
            animationType="slide"
            supportedOrientations={["portrait", "landscape"]}
            statusBarTranslucent
          >
            <View
              style={[
                styles.overlay,
                isLandscape && {
                  alignContent: "center",
                  alignItems: "center",
                  // justifyContent:'center'
                },
              ]}
            >
              <View
                style={[
                  styles.sheet,
                  theme === "dark" && {
                    borderWidth: 1,
                    borderColor: "white",
                  },
                  {
                    width: isLandscape ? "40%" : "100%",
                  },
                ]}
              >
                {/* Divider */}
                <View
                  style={[
                    theme === "dark" && {
                      overflow: "hidden",
                      borderColor: "white",
                    },
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 12,
                      alignContent: "center",
                      alignItems: "center",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme === "dark" ? "white" : "black",
                    }}
                  >
                    {t("text89")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowDatePicker(null);
                    }}
                  >
                    <MaterialIcons name="close" color={"black"} size={24} />
                  </TouchableOpacity>
                </View>
                <View style={styles.divider} />

                {/* Date Picker */}
                <DateTimePicker
                  value={
                    showDatePicker.type === "from" && fromDate
                      ? parseCustomDate(fromDate)
                      : showDatePicker.type === "to" && toDate
                      ? parseCustomDate(toDate)
                      : new Date()
                  }
                  mode="date"
                  display="spinner"
                  is24Hour={false}
                  onChange={handleDateChange}
                  style={[
                    styles.picker,
                    {
                      backgroundColor: "white",
                    },
                  ]}
                />
              </View>
            </View>
          </Modal>
        )}

        {Platform.OS !== "ios" && showDatePicker?.show && (
          <DateTimePicker
            value={
              showDatePicker.type === "from" && fromDate
                ? parseCustomDate(fromDate)
                : showDatePicker.type === "to" && toDate
                ? parseCustomDate(toDate)
                : new Date()
            }
            mode="date"
            display={"spinner"}
            is24Hour={false}
            onChange={handleDateChange}
          />
        )}
      </View>
      <FlatList
        data={[""]}
        key={isLandscape ? `${isHorizontal}-landscape1` : `${isHorizontal}-portrait1`}
        showsVerticalScrollIndicator={false}
        renderItem={() => {
          return (
            <>
              {controlsLoader ? (
                <View
                  style={{
                    height: Dimensions.get("screen").height * 0.75,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme === "dark" ? "black" : "white",
                  }}
                >
                  <FullViewLoader />
                </View>
              ) : error ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme === "dark" ? "black" : "white",
                  }}
                >
                  <ErrorMessage message={error} isShowTop={false} />{" "}
                </View>
              ) : controls?.length === 0 && !isDashboardLoading ? (
                <View
                style={{
                  height: Dimensions.get('screen').height * 0.75,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme === 'dark' ? 'black' : 'white',
                }}
              >
                <View style={{
                  height: 140, width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Image source={ERP_ICON.APP_LOGO} style={[styles.logo,
                  {
                    height: 140,
                    width: 140, marginBottom: 12
                  }
                  ]} resizeMode="contain" />
                  <Text style={{
                    fontSize: 30,
                    fontFamily: "Handlee-Regular",
                     color : theme === 'dark' ? 'white' : 'black'
                  }}>Welcome</Text>
                </View>
              </View>

              ) : (
                <View
                  style={{
                    backgroundColor: theme === "dark" ? "black" : "white",
                    flex: 1,
                  }}
                >
                  <>
                    <Animated.FlatList
                      showsVerticalScrollIndicator={false}
                      data={[""]}
                      keyExtractor={(_, i) => i.toString()}
                      onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        {
                          useNativeDriver: true,
                        },
                      )}
                      scrollEventThrottle={16}
                      renderItem={() => (
                        <View
                          style={{
                            backgroundColor:
                              theme === "dark" ? "black" : "white",
                            flex: 1,
                          }}
                        >
                          <View>
                            {pieChartData.length > 0 && (
                              <PieChartSection
                                pieChartData={pieChartData}
                                navigation={navigation}
                                t={t}
                              />
                            )}
                            {pieChartData.length === 0 && (
                              <View style={{ marginTop: 12 }} />
                            )}
                          </View>
                          <View style={[styles.dashboardSection, 
                            {
                                marginLeft: 2,
                                marginRight: 12,
                              },
                          ]}>

                              <FlatList
                              key={isLandscape ? `${isHorizontal}-landscape3` : `${isHorizontal}-portrait3`}
                              keyboardShouldPersistTaps="handled"
                              data={htmlItems}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({ item, index }) =>
                                renderDashboardItem({
                                  item,
                                  index,
                                  isFromHtml: true,
                                  isFromMenu: true,
                                })
                              } 
                              showsVerticalScrollIndicator={false}
                            />

                         
                          </View>

                          <View
                            style={[
                              styles.dashboardSection,
                              {
                                marginLeft: 2,
                                marginRight: 4,
                              },
                            ]}
                          >
                               <FlatList
                              key={isLandscape ? `${isHorizontal}-landscape2` : `${isHorizontal}-portrait2`}
                              keyboardShouldPersistTaps="handled"
                              data={[...textItems, ...emptyItems]}
                              keyExtractor={(item, index) => index.toString()}
                              numColumns={
                                isLandscape
                                  ? isHorizontal
                                    ? 2
                                    : 4
                                  : isHorizontal
                                  ? 1
                                  : 2
                              }
                              columnWrapperStyle={
                                !isHorizontal ? styles.columnWrapper : undefined
                              }
                              renderItem={({ item, index }) =>
                                renderDashboardItem({
                                  item,
                                  index,
                                  isFromHtml: false,
                                  isFromMenu: false,
                                })
                              }
                              showsVerticalScrollIndicator={false}
                            />
                          
                          </View>
                        </View>
                      )}
                    />

<View style={{
                            height: 350, width: '100%',
                            alignContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                            justifyContent: "center"
                          }}>
                            <Image source={ERP_ICON.APP_LOGO} style={[styles.logo,
                            {
                              height: 140,
                              width: 140, marginBottom: 12
                            }
                            ]} resizeMode="contain" />
                            <Text style={{
                              fontSize: 30,
                              fontFamily: "Handlee-Regular",
                               color : theme === 'dark' ? 'white' : 'black'
                            }}>Welcome</Text>
                          </View>
                  </>
                </View>
              )}
            </>
          );
        }}
      />

      <GreetingBottomSheet
        visible={visibleAI}
        message={aiMessage}
        onClose={() => setVisibleAI(false)}
      />
    </View>
  );
};

export default HomeScreen;
