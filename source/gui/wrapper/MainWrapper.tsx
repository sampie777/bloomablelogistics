import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Routes } from "../../routes";
import Dashboard from "../dashboard/Dashboard";
import MapOverview from "../map/MapOverview";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../theme";
import { useRecoilState, useRecoilValue } from "recoil";
import { orderActionInProgressState, ordersOutdatedState, ordersState } from "../../logic/recoil";
import { Orders } from "../../logic/orders/orders";
import LoadingOverlay from "../utils/LoadingOverlay";
import DateHeader from "./DateHeader";
import OrderDetailsLoader from "../orders/OrderDetailsLoader";
import { Notifications } from "../../logic/notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const TabNav = createBottomTabNavigator();

interface Props {

}

const MainWrapper: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const fetchPage = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useRecoilState(ordersState);
  const [ordersOutdated, setOrdersOutdated] = useRecoilState(ordersOutdatedState);
  const orderActionInProgress = useRecoilValue(orderActionInProgressState);

  useEffect(() => {
    isMounted.current = true;
    Notifications.init();

    if (!isProcessing && fetchPage.current === 0) {
      setOrdersOutdated(true);
    }

    return () => {
      isMounted.current = false;
    };
  });

  useEffect(() => {
    if (!isProcessing && ordersOutdated) {
      setOrdersOutdated(false);
      fetchOrders();
    }
  }, [ordersOutdated]);

  const fetchOrders = () => {
    fetchPage.current = 0;
    setOrders([]);
    fetchNextOrderPage();
  };

  const fetchNextOrderPage = () => {
    setIsProcessing(true);
    setErrorMessage(undefined);

    fetchPage.current++;
    Orders.list()
      .then(_orders => {
        if (!isMounted.current) {
          return;
        }

        if (fetchPage.current > 1) {
          _orders = orders.concat(_orders);
        }

        setOrders(_orders);
      })
      .catch(error => {
        if (!isMounted.current) {
          return;
        }
        setErrorMessage(error.toString());
      })
      .finally(() => {
        if (!isMounted.current) {
          return;
        }
        setIsProcessing(false);
      });
  };

  return <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
      <LoadingOverlay isVisible={isProcessing || orderActionInProgress}
                      text={isProcessing ? "Getting orders..." :
                        (orderActionInProgress ? "Applying..." : undefined)} />
      <OrderDetailsLoader />
      <DateHeader />

      <View>
        {errorMessage === undefined ? undefined :
          <View style={[styles.row, styles.errorView]}>
            <FontAwesome5Icon name={"exclamation-circle"} solid style={[styles.icon, styles.error]} />
            <Text style={styles.error}>{errorMessage}</Text>
          </View>
        }
      </View>

      <TabNav.Navigator initialRouteName={Routes.Dashboard}
                        screenOptions={{
                          tabBarStyle: styles.tabBar,
                          tabBarActiveTintColor: styles.tabBarActiveLabel.color as string,
                        }}>
        <TabNav.Screen name={Routes.Dashboard} component={Dashboard}
                       options={{
                         headerShown: false,
                         tabBarIcon: ({ focused, color, size }) =>
                           <FontAwesome5Icon name="home" size={size} color={color} />,
                       }} />
        <TabNav.Screen name={Routes.Map} component={MapOverview}
                       options={{
                         headerShown: false,
                         tabBarIcon: ({ focused, color, size }) =>
                           <FontAwesome5Icon name="map-marked-alt" size={size} color={color} />,
                       }} />
      </TabNav.Navigator>
    </View>
  </GestureHandlerRootView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  errorView: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#800",
  },
  icon: {
    marginRight: 10,
    color: lightColors.text,
  },
  error: {
    color: "#800",
  },
  tabBar: {
    paddingBottom: 10,
    paddingTop: 7,
    height: 60,
    backgroundColor: lightColors.surface2,
    borderTopColor: lightColors.background,
  },
  tabBarActiveLabel: {
    color: lightColors.primary,
  },
});

export default MainWrapper;
