import React from "react";
import { Order } from "../../../../logic/models";
import { settings } from "../../../../logic/settings/settings";
import { Orders } from "../../../../logic/orders";
import { useOrderAction } from "./utils";
import { Alert } from "react-native";
import { StatusButton, StatusLoading, StatusText } from "./common";

interface Props {
  order: Order;
}

const OrderAcceptStatus: React.FC<Props> = ({ order }) => {
  const [isProcessing, applyOrderAction] = useOrderAction(order);

  if (order.accepted || order.deleted || settings.disableOrderActions) {
    return <StatusText positive={order.accepted}
                       positiveText={"Accepted"}
                       negativeText={"Not accepted"} />;

  }

  const acceptOrder = () => {
    Alert.alert(
      "Accept order",
      "Do you want to accept this order?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => applyOrderAction(
            Orders.reject,
            "Accept order",
            "Failed to mark order as rejected.",
          ),
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

  if (isProcessing || order.isAccepting || order.isRejecting)
    return <StatusLoading text={"Processing..."} />;

  return <StatusButton positive={order.accepted}
                       positiveText={"Accepted"}
                       negativeText={"Not accepted"}
                       onPress={acceptOrder} />;
};

export default OrderAcceptStatus;
