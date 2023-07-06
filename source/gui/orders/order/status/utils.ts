import { Order } from "../../../../logic/orders/models";
import { useRecoilState } from "recoil";
import { orderActionInProgressState } from "../../../../logic/recoil";
import { useState } from "react";
import { settings } from "../../../../logic/settings/settings";
import { rollbar } from "../../../../logic/rollbar";
import { Alert } from "react-native";
import { Orders } from "../../../../logic/orders/orders";

type ApplyOrderActionProps = (action: (order: Order) => Promise<any>,
                              errorTitle: string,
                              errorMessage: string) => void

export const useOrderAction = (order: Order): [
  isProcessing: boolean,
  applyOrderAction: ApplyOrderActionProps
] => {
  const [orderActionInProgress, setOrderActionInProgress] = useRecoilState(orderActionInProgressState);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyOrderAction: ApplyOrderActionProps = (action, errorTitle, errorMessage) => {
    if (settings.disableOrderActions) return;
    setIsProcessing(true);

    action(order)
      .then(loadOrder)
      .catch(e => {
        rollbar.error(errorMessage, { error: e, order: order });
        Alert.alert(errorTitle, `${errorMessage}\n\n${e}.`);
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const loadOrder = () => Orders.fetchStatusForOrder(order)
    .then(updatedOrder => {
      updatedOrder.isAccepting = false;
      updatedOrder.isRejecting = false;
      updatedOrder.isDelivering = false;
      return updatedOrder;
    })
    .then(updatedOrder => {
      order.isAccepting = updatedOrder.isAccepting;
      order.isRejecting = updatedOrder.isRejecting;
      order.isDelivering = updatedOrder.isDelivering;
      order.accepted = updatedOrder.accepted;
      order.delivered = updatedOrder.delivered;

      // Trigger GUI update
      setOrderActionInProgress(true);
      setOrderActionInProgress(false);
    });

  return [
    isProcessing,
    applyOrderAction,
  ];
};
