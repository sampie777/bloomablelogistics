import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { Order } from "../../../logic/models";

interface Props {
  order: Order;
}

const OrderCosts: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"shopping-cart"} solid style={styles.icon} />
        <Text style={styles.orderValue}>R {order.orderValue}</Text>
      </View>
      <View style={styles.row}>
        <FontAwesome5Icon name={"cart-arrow-down"} solid style={styles.icon} />
        <Text style={styles.orderCosts}>R {order.orderCosts}</Text>
      </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 3,
  },
  orderValue: {},
  orderCosts: {},
  icon: {
    marginRight: 10,
    minWidth: 16,
  },
});

export default OrderCosts;
