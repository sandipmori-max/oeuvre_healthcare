import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useAppSelector } from "../../../../store/hooks";
import { ERP_COLOR_CODE } from "../../../../utils/constants";
import TranslatedText from "./TranslatedText";
import DashboardListSheet from "./DashboardListSheet";

const MAX_ITEMS_PER_LIST = 5;

const PieChartSection = ({ pieChartData, navigation, t }: any) => {
  const [firstList, secondList] = useMemo(() => {
    if (!pieChartData) return [[], []];
    const first = pieChartData.slice(0, MAX_ITEMS_PER_LIST);
    const second = pieChartData.slice(MAX_ITEMS_PER_LIST);
    return [first, second];
  }, [pieChartData]);
  const theme = useAppSelector((state) => state?.theme.mode);

  const [isVisibleFullMode, setIsVisibleFullMode] = useState(false);
  const { height, width } = useWindowDimensions();  
  const isLandscape = width > height;

  return (
    pieChartData?.length > 0 && (
      <View
        style={{
          margin: 8,
          borderRadius: 6,
          borderWidth: 0.5,
          borderColor: ERP_COLOR_CODE.ERP_BORDER_LINE,
          marginBottom: 8,
            marginRight: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            height: isLandscape ?  height * 0.48 :  height * 0.22,
          }}
        >
          {/* Pie Chart */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Web", { isFromChart: true })}
            style={{
              width: "30%",
              alignItems: "center",
              justifyContent: "center",
              alignContent: "center",
              marginLeft: 32,
            }}
          >
            <PieChart
              data={pieChartData}
              donut
              radius={78}
              innerRadius={68}
              textSize={14}
              textColor={theme === "dark" ? "#fff" : "#000"}
              showValuesAsLabels
              innerCircleColor={theme === "dark" ? "black" : "#fff"}
              centerLabelComponent={() => (
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: "bold",
                    color:
                      theme === "dark" ? "#fff" : ERP_COLOR_CODE.ERP_APP_COLOR,
                  }}
                >
                  {t("home.dashboard")}
                </Text>
              )}
            />
          </TouchableOpacity>

          {firstList.length > 0 && (
            <View
              style={{
                justifyContent: "center",
                alignContent: "center",
                marginLeft: 34,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                alignContent: "center",
                  width:  "100%",
                  flexDirection:'row',

                  height:isLandscape ? height * 0.48 : height * 0.22,
                }}
              >
                <View 
                style={{
                   width:isLandscape ? "40%":"80%", 
                   justifyContent:'center',
                   alignContent:'center',
                  //  alignItems:'center'
                }}
                >
                  <View
                  style={{
                    marginVertical: 4,
                    alignContent: "center",
                    alignItems: "center",
                  }}
                ></View>
                <FlatList
                  data={firstList}
                  key={isLandscape ? "landscape" : "portrait"}    
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 8,
                          backgroundColor: item.color,
                          marginRight: 6,
                          flexDirection: "row",
                          gap: 4,
                        }}
                      />
                      <TranslatedText
                        numberOfLines={1}
                        style={{
                          width: isLandscape ? "48%" :"26%",
                          fontWeight: "500",
                          maxWidth: 110,
                          color: theme === "dark" ? "#fff" : "#000",
                        }}
                        text={item.text}
                      ></TranslatedText>
                      <TranslatedText
                        style={{
                          marginLeft: 8,
                          width: isLandscape ?  "80%" : "80%",
                          fontSize: 14,
                          color: item.color,
                          fontWeight: "800",
                        }}
                        numberOfLines={1}
                        text={`:- ${item.value}`}
                      ></TranslatedText>
                    </View>
                  )}
                />
                {!isLandscape && firstList.length >= 5 && (
                  <TouchableOpacity
                    onPress={() => {
                      setIsVisibleFullMode(true);
                    }}
                  >
                    <View
                      style={{
                        marginVertical: 4,
                        alignContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "gray",
                          fontSize: 12,
                        }}
                      >
                        View full mode
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
               
                  </View>
{
  isLandscape &&  <View style={{
                   width:'50%',
                   alignContent:'center',
                }}> 
                    <FlatList
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                data={secondList}
                key={isLandscape ? "landscape" : "portrait"}    
                renderItem={({ item }) => (
                  <View
                    style={{
                      marginHorizontal: 4,
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 8,
                        backgroundColor: item.color,
                        marginRight: 6,
                        flexDirection: "row",
                        gap: 4,
                      }}
                    />
                    <TranslatedText
                      text={item.text}
                      numberOfLines={1}
                      style={{ maxWidth: 80 }}
                    ></TranslatedText>
                    <TranslatedText
                      numberOfLines={1}
                      text={`:- ${item.value}`}
                      style={{
                        marginLeft: 8,
                        fontSize: 14,
                        color: item.color,
                        fontWeight: "800",
                      }}
                    ></TranslatedText>
                  </View>
                )}
              />
                  </View>
}
                  
              </View>
            </View>
          )}
        </View>
        {!isLandscape && secondList.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 12,
            }}
          >
            <View>
              <FlatList
              key={isLandscape ? "landscape" : "portrait"}    
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                horizontal={true}
                keyExtractor={(item, index) => index.toString()}
                data={secondList}
                renderItem={({ item }) => (
                  <View
                    style={{
                      marginHorizontal: 4,
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 8,
                        backgroundColor: item.color,
                        marginRight: 6,
                        flexDirection: "row",
                        gap: 4,
                      }}
                    />
                    <TranslatedText
                      text={item.text}
                      numberOfLines={1}
                      style={{ maxWidth: 80 }}
                    ></TranslatedText>
                    <TranslatedText
                      numberOfLines={1}
                      text={`:- ${item.value}`}
                      style={{
                        marginLeft: 8,
                        fontSize: 14,
                        color: item.color,
                        fontWeight: "800",
                      }}
                    ></TranslatedText>
                  </View>
                )}
              />
            </View>
          </View>
        )}

        <DashboardListSheet
          visible={isVisibleFullMode}
          data={pieChartData}
          onClose={() => setIsVisibleFullMode(false)}
        />
      </View>
    )
  );
};

export default PieChartSection;
