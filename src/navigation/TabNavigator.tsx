import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DARK_COLOR, ERP_COLOR_CODE } from "../utils/constants";
import MenuTab from "../screens/dashboard/tabs/MenuTab/MenuTab";
import HomeScreen from "../screens/dashboard/tabs/home/HomeTab";
import ProfileTab from "../screens/dashboard/tabs/profile/ProfileTab";
import useTranslations from "../hooks/useTranslations";
import { useAppSelector } from "../store/hooks";
import TabIcon from "../components/tab_icon/TabIcon";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const theme = useAppSelector((state) => state.theme.mode);
  const { t } = useTranslations();
  const { appBottomMenuList } = useAppSelector(state => state?.auth);

  const navigationItems = (appBottomMenuList || []).map(item => ({
      name:  item?.name,
      type: item?.type,
      icon: item?.icon,
      label: item?.name,
      search: item?.name,
  }));

  const tabConfig = [
    {
      name: "Home",
      component: HomeScreen,
      icon: "home",
      label: t("navigation.home"),
    },
    {
      name: "Entry",
      type: "E",
      icon: "entry",
      label: t("navigation.entry"),
      search: t("navigation.search_entry"),
    },
    {
      name: "Report",
      type: "R",
      icon: "report",
      label: t("navigation.report"),
      search: t("navigation.search_report"),
    },
    {
      name: "Auth",
      type: "A",
      icon: "auth",
      label: t("navigation.auth"),
      search: t("navigation.search_auth"),
    },
    {
      name: "Profile",
      component: ProfileTab,
      icon: "profile",
      label: t("navigation.profile"),
    },
  ];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "left",
        tabBarActiveTintColor:
          theme === "dark" ? "white" : ERP_COLOR_CODE.ERP_APP_COLOR,
        tabBarInactiveTintColor:
          theme === "dark" ? "black" : ERP_COLOR_CODE.ERP_APP_COLOR,
        tabBarStyle: {
          backgroundColor: theme === "dark" ? DARK_COLOR : ERP_COLOR_CODE.ERP_WHITE,
          height: 80,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor: theme === "dark" ? DARK_COLOR : ERP_COLOR_CODE.ERP_APP_COLOR,
        },
        headerTintColor: "white",
      }}
    >
      {tabConfig.map((tab, index) => (
        <Tab.Screen
          key={index}
          name={tab.name}
          children={
            tab.component
              ? () => <tab.component />
              : () => (
                  <MenuTab
                    type={tab.type}
                    headerText={tab.label}
                    searchPlaceholder={tab.search}
                  />
                )
          }
          options={{
            tabBarLabel: tab.label,
            title: tab.label,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "500",
              marginTop: 8,
            },
            tabBarIcon: ({ color, size, focused }) => (
              <TabIcon
                name={tab.icon}
                color={color}
                size={size}
                focused={focused}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNavigator;
