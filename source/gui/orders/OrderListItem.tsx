import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Order } from "../../logic/orders";
import { format } from "../../logic/utils";
import { lightColors } from "../theme";

interface Props {
  order: Order;
}

const OrderListItem: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
    <Text>number: {order.number}</Text>
    <Text>createdAt: {format(order.createdAt, "%YYYY-%mm-%dd at %HH:%MM")}</Text>
    <Text>partner: {order.partner}</Text>
    <Text>clientName: {order.clientName}</Text>
    <Text>clientEmail: {order.clientEmail}</Text>
    <Text>clientPhones: {order.clientPhones.map((it, i) => <Text key={i}>{it}</Text>)}</Text>
    <Text>paymentType: {order.paymentType}</Text>
    <Text>florist: {order.florist}</Text>
    <Text>deliverAt: {format(order.deliverAt, "%YYYY-%mm-%dd")}</Text>
    <Text>orderValue: R {order.orderValue}</Text>
    <Text>orderCosts: R {order.orderCosts}</Text>
    <Text>accepted: {order.accepted ? "Yes" : "No"}</Text>
    <Text>delivered: {order.delivered ? "Yes" : "No"}</Text>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
});

export default OrderListItem;
