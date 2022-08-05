import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { lightColors } from "../theme";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  enabled: boolean;
  onPress?: () => void;
}

const SmartAddressButton: React.FC<Props> = ({ enabled, onPress }) => {
  return <TouchableOpacity onPress={onPress} style={styles.container}>
    <FontAwesome5Icon name={"home"} style={styles.icon} />
    <FontAwesome5Icon name={"wrench"} style={[styles.icon, styles.iconWrench, styles.iconWrenchBackground]} />
    <FontAwesome5Icon name={"wrench"} style={[styles.icon, styles.iconWrench]} />
    {enabled ? undefined :
      <>
        <FontAwesome5Icon name={"slash"} style={[styles.icon, styles.iconSlash, styles.iconSlashBackground]} />
        <FontAwesome5Icon name={"slash"} style={[styles.icon, styles.iconSlash]} />
      </>}
  </TouchableOpacity>;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightColors.button,
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    position: "absolute",
    top: 15,
    left: 15,
    overflow: "hidden",
  },
  icon: {
    color: lightColors.text,
    fontSize: 17,
    marginRight: 2,
    marginBottom: 1,
  },
  iconWrenchBackground: {
    transform: [
      { scale: 2 },
    ],
    color: lightColors.button,
  },
  iconWrench: {
    position: "absolute",
    fontSize: 10,
    right: 4,
    bottom: 8,
  },
  iconSlashBackground: {
    transform: [
      { scale: 2 },
    ],
    color: lightColors.button,
  },
  iconSlash: {
    position: "absolute",
  },
});

export default SmartAddressButton;
