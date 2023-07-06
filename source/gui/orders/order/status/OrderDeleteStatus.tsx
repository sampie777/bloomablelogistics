import React from "react";
import { Text } from "react-native";
import { Order } from "../../../../logic/orders/models";
import { settings } from "../../../../logic/settings/settings";
import { styles } from "./common";

interface Props {
  order: Order;
}

const OrderDeleteStatus: React.FC<Props> = ({ order }) => {
  if (!order.deleted || settings.disableOrderActions)
    return null;

  return <Text
    style={[styles.boolean, styles.booleanError]}>
    Deleted
  </Text>;
};

export default OrderDeleteStatus;
