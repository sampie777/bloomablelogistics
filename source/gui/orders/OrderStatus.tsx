import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Order } from "../../logic/orders";

interface Props {
  order: Order;
}

const OrderStatus: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
    <Text
      style={[styles.accepted, styles.boolean, (order.accepted ? styles.booleanPositive : styles.booleanNegative)]}>
      {order.accepted ? "Accepted" : "Not accepted"}
    </Text>
    <Text
      style={[styles.delivered, styles.boolean, (order.delivered ? styles.booleanPositive : styles.booleanNegative)]}>
      {order.delivered ? "Delivered" : "Not delivered"}
    </Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 10,
  },
  accepted: {},
  delivered: {},
  boolean: {
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  booleanPositive: {
    backgroundColor: "#00c900",
    color: "#fff",
  },
  booleanNegative: {
    backgroundColor: "#ec8700",
    color: "#fff",
  },
});

export default OrderStatus;
