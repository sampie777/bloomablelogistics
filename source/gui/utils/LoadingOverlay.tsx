import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

const LoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string | null;
  opacity?: number;
}> = ({ isVisible, text, opacity }) => {
  if (!isVisible) {
    return null;
  }

  if (text === undefined) {
    text = "Loading...";
  }

  let backgroundColor = "#fffc";
  if (opacity !== undefined) {
    backgroundColor = "#fff";
    backgroundColor += Math.round(Math.max(0, Math.min(1, opacity)) * 15).toString(16);
  }

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <ActivityIndicator style={styles.icon}
                         size={styles.icon.fontSize}
                         color={styles.icon.color} />
      {text === "" || text === null ? null : <Text style={styles.text}>{text}</Text>}
    </View>
  );
};


export default LoadingOverlay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9,
  },
  icon: {
    fontSize: 80,
    color: "#8d8d8e",
    opacity: 0.7,
  },
  text: {
    paddingTop: 10,
    fontSize: 16,
    color: "#8d8d8e",
  },
});
