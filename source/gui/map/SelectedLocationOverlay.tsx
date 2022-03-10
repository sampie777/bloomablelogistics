import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Location } from "../../logic/location/Locations";
import OrdersList from "../orders/OrdersList";
import { lightColors } from "../theme";

interface Props {
  location: Location;
  unselectLocation?: () => void
}

const SelectedLocationOverlay: React.FC<Props> = ({ location, unselectLocation }) => {
  return <View style={styles.container}>
    <OrdersList orders={location.orders}
                showHeader={false} />

    <TouchableOpacity onPress={unselectLocation}
                      style={styles.overlayButton}>
      <Text style={styles.buttonText}>Back</Text>
    </TouchableOpacity>
  </View>;
};

const styles = StyleSheet.create({
  containerButton: {},
  container: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backgroundColor: "#0002",
  },
  overlayButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: lightColors.surface2,
    borderRadius: 30,
    elevation: 3,
    paddingVertical: 13,
    paddingHorizontal: 60,
  },
  buttonText: {
    fontSize: 15,
  },
});

export default SelectedLocationOverlay;
