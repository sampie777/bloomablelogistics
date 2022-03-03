import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Order } from "../../logic/orders";

interface Props {
  order: Order;
}

const OrderListItem: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
    <Text>{order.clientName}</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OrderListItem;
