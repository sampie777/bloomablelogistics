import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { lightColors } from "../theme";
import { Order } from "../../logic/models";

interface Props {
  orders: Order[];
}

const ListHeaderComponent: React.FC<Props> = ({ orders }) => {
  return <View style={styles.container}>
    <Text style={styles.message}>{orders.length} orders</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    fontWeight: "bold",
    fontSize: 18,
    color: lightColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ListHeaderComponent;
