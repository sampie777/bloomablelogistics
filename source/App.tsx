import React, { useState } from "react";
import {
  SafeAreaView, StatusBar,
  StyleSheet, View,
} from "react-native";
import LoginScreen from "./gui/login/LoginScreen";
import OrdersList from "./gui/orders/OrdersList";
import server from "./logic/server";
import AppInformation from "./gui/appInformation/AppInformation";
import ErrorBoundary from "./gui/utils/ErrorBoundary";
import { lightColors } from "./gui/theme";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(server.isLoggedIn());

  const reloadLoginStatus = () => setIsLoggedIn(server.isLoggedIn);

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBoundary>
      </ErrorBoundary>

      <StatusBar barStyle={"default"}
                 backgroundColor={lightColors.background}
                 hidden={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
});

export default App;
