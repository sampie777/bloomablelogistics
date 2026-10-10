import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Routes } from "../../routes";
import Dashboard from "../dashboard/Dashboard";
import MapOverview from "../map/MapOverview";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../theme";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  orderActionInProgressState,
  ordersLoadingProgressState,
  ordersOutdatedState,
  ordersState,
} from "../../logic/recoil";
import { Orders } from "../../logic/orders/orders";
import LoadingOverlay from "../utils/LoadingOverlay";
import DateHeader from "./DateHeader";
import OrdersLoadingProgressBar from "../dashboard/OrdersLoadingProgressBar";
import OrderDetailsLoader from "../orders/OrderDetailsLoader";
import { Notifications } from "../../logic/notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BloomableApi } from "../../logic/bloomable/api";

const TabNav = createBottomTabNavigator();

interface Props {}

const initialPendingStatuses = ["open", "accepted", "fulfilled", "delivered", "cancel-confirmed"];

const MainWrapper: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const isApiLoaded = useRef(false);
  const fetchPage = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useRecoilState(ordersState);
  const [ordersOutdated, setOrdersOutdated] = useRecoilState(ordersOutdatedState);
  const orderActionInProgress = useRecoilValue(orderActionInProgressState);
  const setOrdersLoadingProgress = useSetRecoilState(ordersLoadingProgressState);

  useEffect(() => {
    isMounted.current = true;
    Notifications.init();

    if (!isProcessing && fetchPage.current === 0) {
      setOrdersOutdated(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isProcessing && ordersOutdated) {
      setOrdersOutdated(false);
      fetchOrders();
    }
  }, [ordersOutdated]);

  /**
   * Fire up the api by sending a request, so the login procedure can be done,
   * so the other api calls (fetching orders, ...) are authorized to go.
   */
  const initApi = async () => {
    if (isApiLoaded.current) return;
    if (!isMounted.current) return;

    try {
      await BloomableApi.getProfile();
      isApiLoaded.current = true;
    } catch (error: any) {
      if (!isMounted.current) return;
      setErrorMessage(error.toString());
      throw error;
    }
  };

  const fetchOrders = async () => {
    setIsProcessing(true);
    setErrorMessage(undefined);

    try {
      await initApi();
      if (!isMounted.current) return;

      fetchPage.current = 0;
      setOrders([]);
      fetchNextOrderPage();
    } catch {
      if (!isMounted.current) return;
      setIsProcessing(false);
      setOrdersLoadingProgress({ isLoading: false, completed: 0, total: 5, pendingStatuses: [] });
    }
  };

  const fetchNextOrderPage = () => {
    setIsProcessing(true);
    setErrorMessage(undefined);
    setOrdersLoadingProgress({
      isLoading: true,
      completed: 0,
      total: 5,
      pendingStatuses: [...initialPendingStatuses],
    });
    if (!isMounted.current) return;

    fetchPage.current++;
    Orders.list((batchOrders, completed, total, pendingStatuses) => {
      if (!isMounted.current) return;
      setOrders(batchOrders);
      setOrdersLoadingProgress({
        isLoading: true,
        completed,
        total,
        pendingStatuses: pendingStatuses ?? [],
      });
      // As soon as the first batch arrives, dismiss the blocking overlay
      // so the user can see and interact with incoming orders immediately
      setIsProcessing(false);
    })
      .then(_orders => {
        if (!isMounted.current) return;

        if (fetchPage.current > 1) {
          _orders = orders.concat(_orders);
        }

        setOrders(_orders);
      })
      .catch(error => {
        if (!isMounted.current) return;
        setErrorMessage(error.toString());
      })
      .finally(() => {
        if (!isMounted.current) return;
        setIsProcessing(false);
        setOrdersLoadingProgress({ isLoading: false, completed: 5, total: 5, pendingStatuses: [] });
      });
  };

  return <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
      <LoadingOverlay isVisible={isProcessing || orderActionInProgress}
                      text={isProcessing ? "Getting orders..." :
                        (orderActionInProgress ? "Applying..." : undefined)} />
      <OrderDetailsLoader />
      <DateHeader />
      <OrdersLoadingProgressBar />

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
    justifyContent: "space-between",
  },
  icon: {
    paddingRight: 10,
    fontSize: 18,
  },
  error: {
    color: lightColors.textError,
  },
  errorView: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff0f0",
  },
  tabBar: {
    backgroundColor: lightColors.surface2,
    borderTopColor: lightColors.border,
  },
  tabBarActiveLabel: {
    color: lightColors.primary,
  },
});

export default MainWrapper;
