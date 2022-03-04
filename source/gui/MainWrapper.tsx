import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import LoginScreen from "./login/LoginScreen";
import Map from "./map/Map";
import OrdersList from "./orders/OrdersList";
import AppInformation from "./appInformation/AppInformation";
import server from "../logic/bloomable/server";
import { Order } from "../logic/models";

interface Props {

}

const MainWrapper: React.FC<Props> = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(server.isLoggedIn());
  const [mapOrders, setMapOrders] = useState<Order[]>([]);

  const reloadLoginStatus = () => {
    setIsLoggedIn(server.isLoggedIn());
  };

  return <View style={styles.container}>
    <LoginScreen onLoggedInChange={reloadLoginStatus} />

    <Map orders={mapOrders} />

    {!isLoggedIn ? undefined : <OrdersList setMapOrders={setMapOrders} />}

    <AppInformation />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainWrapper;
