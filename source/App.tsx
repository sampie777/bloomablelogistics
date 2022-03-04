import React from "react";
import {
  SafeAreaView, StatusBar,
  StyleSheet,
} from "react-native";
import ErrorBoundary from "./gui/utils/ErrorBoundary";
import { lightColors } from "./gui/theme";
import MainWrapper from "./gui/MainWrapper";

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ErrorBoundary>
        <MainWrapper />
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
