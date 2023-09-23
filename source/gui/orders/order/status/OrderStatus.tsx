import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Order } from "../../../../logic/orders/models";
import { settings } from "../../../../logic/settings/settings";
import { Orders } from "../../../../logic/orders/orders";
import { useOrderAction } from "./utils";
import { ParamList, Routes } from "../../../../routes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatusButton, StatusLoading } from "./StatusButton";

interface Props {
  order: Order;
}

const OrderStatus: React.FC<Props> = ({ order }) => {
  const [isProcessing, applyOrderAction] = useOrderAction(order);
  const navigation = useNavigation<NativeStackNavigationProp<ParamList, any>>();

  const getStatusAction = (): (() => void) | null => {
    if (settings.disableOrderActions) return null;

    if (order.status === "open") {
      return acceptOrder;
    } else if (order.status === "accepted") {
      return fulfillOrder;
    } else if (order.status === "fulfilled") {
      return deliverOrder;
    } else if (order.status === "cancelled") {
      return reacceptOrder;
    }
    return null;
  };

  const acceptOrder = () => {
    Alert.alert(
      "Accept order",
      "Do you want to accept this order?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => navigation.navigate(Routes.RejectOrder, { orderId: order.id }),
          style: "default",
        },
        {
          text: "Accept",
          onPress: () => applyOrderAction(
            Orders.accept,
            "Accept order",
            "Failed to mark order as accepted.",
          ),
          style: "default",
        },
      ],
      { cancelable: true },
    );
  };

  const fulfillOrder = () => {
    Alert.alert(
      "Deliver order",
      "Are you sure you want to mark this order as dispatched?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Dispatch",
          onPress: () => applyOrderAction(
            Orders.fulfill,
            "Dispatch order",
            "Failed to mark order as dispatched.",
          ),
          style: "default",
        },
      ],
      { cancelable: true },
    );
  };

  const deliverOrder = () => {
    Alert.alert(
      "Deliver order",
      "Are you sure you want to complete this order by marking it as delivered?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: () => applyOrderAction(
            Orders.deliver,
            "Deliver order",
            "Failed to mark order as delivered.",
          ),
          style: "default",
        },
      ],
      { cancelable: true },
    );
  };

  const reacceptOrder = () => {
    Alert.alert(
      "Re-accept order",
      "This action is not implemented.",
      [
        {
          text: "Close",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  };


  const onStatusAction = getStatusAction();

  if (isProcessing || order.isProcessing)
    return <View style={styles.container}>
      <StatusLoading text={"Processing..."} />
    </View>;

  return <View style={styles.container}>
    <StatusButton status={order.status}
                  onPress={onStatusAction ?? undefined} />
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
