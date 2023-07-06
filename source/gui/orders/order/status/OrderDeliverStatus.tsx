import React from "react";
import { Order } from "../../../../logic/orders/models";
import { settings } from "../../../../logic/settings/settings";
import { Orders } from "../../../../logic/orders/orders";
import { useOrderAction } from "./utils";
import { Alert } from "react-native";
import { StatusButton, StatusLoading, StatusText } from "./common";

interface Props {
  order: Order;
}

const OrderDeliverStatus: React.FC<Props> = ({ order }) => {
  const [isProcessing, applyOrderAction] = useOrderAction(order);

  if (order.delivered || !order.accepted || order.deleted || settings.disableOrderActions)
    return <StatusText positive={order.delivered}
                       positiveText={"Delivered"}
                       negativeText={"Not delivered"} />;

  const deliverOrder = () => {
    Alert.alert(
      "Deliver order",
      "Are you sure you want to mark this order as delivered?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deliver",
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

  if (isProcessing || order.isDelivering)
    return <StatusLoading text={"Processing..."} />;

  return <StatusButton positive={order.delivered}
                       positiveText={"Delivered"}
                       negativeText={"Not delivered"}
                       onPress={deliverOrder} />;
};

export default OrderDeliverStatus;
