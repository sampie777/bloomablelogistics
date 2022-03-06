import React from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { routes } from "../routes";
import Dashboard from "./dashboard/Dashboard";
import MapOverview from "./map/MapOverview";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "./theme";

const TabNav = createBottomTabNavigator();

interface Props {

}

const MainWrapper: React.FC<Props> = () => {
  return <View style={styles.container}>
    <TabNav.Navigator initialRouteName={routes.Dashboard}
                      screenOptions={{
                        tabBarStyle: styles.tabBar,
                      }}>
      <TabNav.Screen name={routes.Dashboard} component={Dashboard}
                     options={{
                       headerShown: false,
                       tabBarIcon: ({ focused, color, size }) =>
                         <FontAwesome5Icon name="home" size={size} color={color} />,
                     }} />
      <TabNav.Screen name={routes.Map} component={MapOverview}
                     options={{
                       headerShown: false,
                       tabBarIcon: ({ focused, color, size }) =>
                         <FontAwesome5Icon name="map-marker-alt" size={size} color={color} />,
                     }} />
    </TabNav.Navigator>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    paddingBottom: 10,
    paddingTop: 7,
    height: 60,
    backgroundColor: lightColors.surface1,
    borderTopColor: lightColors.background,
  },
});

export default MainWrapper;
