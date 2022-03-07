import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { routes } from "../../routes";
import Dashboard from "../dashboard/Dashboard";
import MapOverview from "../map/MapOverview";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../theme";
import { useRecoilState } from "recoil";
import { ordersState } from "../../logic/recoil";
import { Orders } from "../../logic/orders";
import { Order } from "../../logic/models";
import LoadingOverlay from "../utils/LoadingOverlay";
import DateHeader from "./DateHeader";
import OrderDetailsLoader from "../orders/OrderDetailsLoader";

const TabNav = createBottomTabNavigator();

interface Props {

}

const MainWrapper: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const fetchPage = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useRecoilState(ordersState);

  useEffect(() => {
    isMounted.current = true;

    if (!isProcessing && orders.length === 0) {
      fetchOrders();
    }
    return () => {
      isMounted.current = false;
    };
  });

  const fetchOrders = () => {
    fetchPage.current = 0;
    setOrders([]);
    fetchNextOrderPage();
  };

  const fetchNextOrderPage = () => {
    setIsProcessing(true);
    setErrorMessage(undefined);

    fetchPage.current++;
    Orders.fetchPage(fetchPage.current)
      .then(_orders => {
        if (!isMounted.current) {
          return;
        }

        if (fetchPage.current > 1) {
          _orders = orders.concat(_orders);
        }

        setAndSortOrders(_orders);
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

  const setAndSortOrders = (_orders: Order[]) => {
    setOrders(Orders.sort(_orders));
  };

  return <View style={styles.container}>
    <LoadingOverlay isVisible={isProcessing} />
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
                         <FontAwesome5Icon name="map-marked-alt" size={size} color={color} />,
                     }} />
    </TabNav.Navigator>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  error: {
    color: "#800",
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
