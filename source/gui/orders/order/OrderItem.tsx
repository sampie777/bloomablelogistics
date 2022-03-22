import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { format } from "../../../logic/utils";
import { lightColors } from "../../theme";
import ClientInfo from "./ClientInfo";
import AdditionalInfo from "./AdditionalInfo";
import OrderStatus from "./OrderStatus";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import OrderCosts from "./OrderCosts";
import RecipientInfo from "./RecipientInfo";
import { Order } from "../../../logic/models";

interface Props {
  order: Order;
  onOrderUpdated?: () => void;
}

const OrderItem: React.FC<Props> = ({ order, onOrderUpdated }) => {
  return <View style={[styles.container, (order.deleted ? styles.deleted : {})]}>
    <View style={styles.row}>
      <Text style={styles.number} selectable={true}>{order.number}</Text>

      <View style={styles.deliverAtDate}>
        <FontAwesome5Icon name={"truck"} style={styles.icon} />
        <Text style={styles.deliverAtDateDate}>{format(order.deliverAtDate, "%dd-%mm-%YYYY") || "unknown"}</Text>
      </View>
    </View>

    <RecipientInfo order={order} onRecipientUpdated={onOrderUpdated} />
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

