import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Order } from "../../logic/orders";
import { format } from "../../logic/utils";
import { lightColors } from "../theme";
import ClientInfo from "./ClientInfo";
import AdditionalInfo from "./AdditionalInfo";
import OrderStatus from "./OrderStatus";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import OrderCosts from "./OrderCosts";

interface Props {
  order: Order;
}

const OrderListItem: React.FC<Props> = ({ order }) => {
  return <View style={[styles.container, (order.deleted ? styles.deleted : {})]}>
    <View style={styles.row}>
      <Text style={styles.number}>{order.number}</Text>

      <View style={styles.deliverAtDate}>
        <FontAwesome5Icon name={"truck"} style={styles.icon} />
        <Text style={styles.deliverAtDateDate}>{format(order.deliverAtDate, "%YYYY-%mm-%dd")}</Text>
      </View>
    </View>

    <OrderCosts order={order} />
    <ClientInfo order={order} />
    <AdditionalInfo order={order} />
    <OrderStatus order={order} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  deleted: {
    backgroundColor: "#aaa",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },

  number: {
    color: lightColors.primary,
  },
  deliverAtDate: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  deliverAtDateDate: {
    fontWeight: "bold",
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
  },
});

export default OrderListItem;
