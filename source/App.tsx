import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import ErrorBoundary from "./gui/utils/ErrorBoundary";
import { lightColors } from "./gui/theme";
import AppRoot from "./gui/AppRoot";

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ErrorBoundary>
        <AppRoot />
      </ErrorBoundary>

      <StatusBar barStyle={"dark-content"}
                 backgroundColor={lightColors.surface2}
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
