import React from "react";
import { StyleSheet, Text, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { Order } from "../../../logic/orders/models";
import { lightColors } from "../../theme";

interface Props {
  order: Order;
}

const OrderCosts: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
    {order.orderValue === undefined ? <View /> :
      <View style={styles.row}>
        <FontAwesome5Icon name={"shopping-cart"} solid style={styles.icon} />
        <Text style={styles.orderValue}>R {order.orderValue.toFixed(2)}</Text>
      </View>
    }
    {order.orderCosts === undefined ? undefined :
      <View style={styles.row}>
        <FontAwesome5Icon name={"hand-holding-usd"} solid style={styles.icon} />
        <Text style={styles.orderCosts}>R {order.orderCosts.toFixed(2)}</Text>
      </View>
    }
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  orderValue: {
    color: lightColors.text,
  },
  orderCosts: {
    color: lightColors.text,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
    color: lightColors.text,
  },
});

export default OrderCosts;
