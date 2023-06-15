import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { getVersion } from "react-native-device-info";
import { displayName } from "../../../app.json";
import { defaultFontFamilies, lightColors } from "../theme";

interface Props {

}

const AppInformation: React.FC<Props> = () => {
  return <View style={styles.container}>
    <Text style={styles.appName}>{displayName}</Text>
    <Text style={styles.version}>
      version: {getVersion()} {process.env.NODE_ENV === "production" ? undefined : `(${process.env.NODE_ENV})`}
    </Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: 10,
  },
  appName: {
    color: lightColors.primary,
    fontSize: 13,
    fontFamily: defaultFontFamilies.sansSerifLight,
  },
  version: {
    color: lightColors.textLighter,
    fontSize: 10,
    fontFamily: defaultFontFamilies.sansSerifLight,
  },
});

export default AppInformation;
