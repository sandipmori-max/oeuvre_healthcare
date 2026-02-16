import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DARK_COLOR, ERP_COLOR_CODE } from "../utils/constants";
import MenuTab from "../screens/dashboard/tabs/MenuTab/MenuTab";
import HomeScreen from "../screens/dashboard/tabs/home/HomeTab";
import ProfileTab from "../screens/dashboard/tabs/profile/ProfileTab";
import useTranslations from "../hooks/useTranslations";
import { useAppSelector } from "../store/hooks";
import AnimatedTabIcon from "../components/tab_icon/AnimatedTabIcon";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const theme = useAppSelector((state) => state.theme.mode);
  const { appBottomMenuList } = useAppSelector(state => state?.auth);

  console.log("appBottomMenuList", appBottomMenuList)
  const navigationItems = (appBottomMenuList || []).map(item => ({
    name: item?.name,
    type: item?.code,
    icon: item?.iconname?.toLowerCase(), // icon name lowercase for safety
    label: item?.name,
  }));

  const getComponent = (item) => {
    if (item.name === "Home") return HomeScreen;
    if (item.name === "Profile") return ProfileTab;
    return null; // बाकी MenuTab में जाएगा
  };

if (!appBottomMenuList || appBottomMenuList.length === 0) {
  return null; // ya loading spinner
}


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
          backgroundColor:
            theme === "dark" ? DARK_COLOR : ERP_COLOR_CODE.ERP_WHITE,
          height: 80,
          paddingBottom: 5,
          paddingTop: 5,
        },
        headerStyle: {
          backgroundColor:
            theme === "dark" ? DARK_COLOR : ERP_COLOR_CODE.ERP_APP_COLOR,
        },
        headerTintColor: "white",
      }}
    >
      {navigationItems.map((item, index) => {
        const Component = getComponent(item);

        return (
          <Tab.Screen
            key={index}
            name={item.name}
            children={
              Component
                ? () => <Component />
                : () => (
                    <MenuTab
                      type={item.type}
                      headerText={item.label}
                      searchPlaceholder={`Search ${item.label}`}
                    />
                  )
            }
            options={{
              tabBarLabel: item.label,
              title: item.label,
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "500",
                marginTop: 8,
              },
              tabBarIcon: ({ color, size, focused }) => (
                <AnimatedTabIcon
                  name={item.icon}
                  color={color}
                  size={size}
                  focused={focused}
                />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

export default TabNavigator;
