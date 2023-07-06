import React from "react";
import { StyleSheet, View } from "react-native";
import { Order } from "../../../logic/orders/models";
import OrderAcceptStatus from "./status/OrderAcceptStatus";
import OrderDeliverStatus from "./status/OrderDeliverStatus";
import OrderDeleteStatus from "./status/OrderDeleteStatus";

interface Props {
  order: Order;
}

const OrderStatus: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
    <OrderAcceptStatus order={order} />
    <OrderDeliverStatus order={order} />
    <OrderDeleteStatus order={order} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
  },
});

export default OrderStatus;
