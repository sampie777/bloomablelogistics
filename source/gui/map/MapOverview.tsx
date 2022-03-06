import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {

}

const MapOverview: React.FC<Props> = () => {
  return <View style={styles.container}>
    <Text>Map</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapOverview;
