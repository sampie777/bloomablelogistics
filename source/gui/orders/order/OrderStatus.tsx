import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Order } from "../../../logic/models";
import { lightColors } from "../../theme";

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
    {!order.deleted ? undefined : <Text
      style={[styles.deleted, styles.boolean, styles.booleanError]}>
      Deleted
    </Text>}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 10,
  },
  accepted: {},
  delivered: {},
  deleted: {},
  boolean: {
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
    color: lightColors.text,
  },
  booleanPositive: {
    backgroundColor: "#00c900",
    color: "#fff",
  },
  booleanNegative: {
    backgroundColor: "#ec8700",
    color: "#fff",
  },
  booleanError: {
    backgroundColor: "#ec0000",
    color: "#fff",
  },
});

export default OrderStatus;
