import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { lightColors } from "../theme";

interface Props {

}

const ListEmptyComponent: React.FC<Props> = () => {
  return <View style={styles.container}>
    <Text style={styles.message}>No orders...</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    color: lightColors.textLighter,
    marginVertical: 30,
  },
});

export default ListEmptyComponent;
