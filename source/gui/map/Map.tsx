import React from "react";
import { StyleSheet, View } from "react-native";
import MapView from "react-native-maps";
import { Order } from "../../logic/models";

interface Props {
  orders: Order[];
}

const Map: React.FC<Props> = ({ orders }) => {
  return <View style={styles.container}>
    <MapView style={{ flex: 1 }}
             showsUserLocation={true}
             userLocationPriority={"balanced"}/>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Map;
