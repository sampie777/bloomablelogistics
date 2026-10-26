import React from "react";
import { StatusBar, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ErrorBoundary from "./gui/utils/ErrorBoundary";
import { lightColors } from "./gui/theme";
import AppRoot from "./gui/AppRoot";

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <ErrorBoundary>
            <AppRoot />
          </ErrorBoundary>

          <StatusBar
            barStyle={"dark-content"}
            backgroundColor={lightColors.surface2}
            hidden={false}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
});

export default App;
