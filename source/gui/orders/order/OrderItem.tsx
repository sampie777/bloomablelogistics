import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { format } from "../../../logic/utils";
import { lightColors } from "../../theme";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import OrderCosts from "./OrderCosts";
import RecipientInfo from "./RecipientInfo";
import { Order } from "../../../logic/orders/models";
import UrlLink from "../../utils/UrlLink";
import OrderStatus from "./status/OrderStatus";

interface Props {
  order: Order;
  acceptOrder?: (order: Order) => void;
  deliveredOrder?: (order: Order) => void;
}

const OrderItem: React.FC<Props> = ({ order }) => {
  return <View style={[
    styles.container,
    (["rejected", "cancelled", "cancel-confirmed"].includes(order.status) ? styles.deleted : {}),
  ]}>
    <View style={styles.row}>
      <UrlLink url={`https://dashboard.bloomable.com/order/${order.id}`}>
        <Text style={styles.number} selectable={true}>{order.number}</Text>
      </UrlLink>

      <View style={styles.deliverAtDate}>
        <FontAwesome5Icon name={"truck"} style={styles.icon} />
        <Text style={styles.deliverAtDateDate}>{format(order.deliverAtDate, "%dd-%mm-%YYYY") || "unknown"}</Text>
      </View>
    </View>

    <RecipientInfo order={order} />
    <OrderCosts order={order} />
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
    backgroundColor: "#eaeaea",
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
    color: lightColors.text,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
    color: lightColors.text,
  },
});

export default OrderItem;

