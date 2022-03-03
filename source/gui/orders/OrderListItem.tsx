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
import RecipientInfo from "./RecipientInfo";

interface Props {
  order: Order;
}

const OrderListItem: React.FC<Props> = ({ order }) => {
  return <View style={[styles.container, (order.deleted ? styles.deleted : {})]}>
    <View style={styles.row}>
      <Text style={styles.number} selectable={true}>{order.number}</Text>

      <View style={styles.deliverAtDate}>
        <FontAwesome5Icon name={"truck"} style={styles.icon} />
        <Text style={styles.deliverAtDateDate}>{format(order.deliverAtDate, "%YYYY-%mm-%dd")}</Text>
      </View>
    </View>

    {order.recipient == null ? undefined :
      <RecipientInfo recipient={order.recipient} />}
    <OrderCosts order={order} />
    <ClientInfo order={order} />
    <AdditionalInfo order={order} />
    <OrderStatus order={order} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderColor: lightColors.border,
    backgroundColor: lightColors.surface1,
    marginBottom: 10,
    marginHorizontal: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 3,
  },
  deleted: {
    backgroundColor: "#aaa",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
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

