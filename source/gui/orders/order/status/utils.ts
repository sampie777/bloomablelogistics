import { Order } from "../../../../logic/orders/models";
import { useRecoilState } from "recoil";
import { orderActionInProgressState } from "../../../../logic/recoil";
import { useState } from "react";
import { settings } from "../../../../logic/settings/settings";
import { rollbar, sanitizeErrorForRollbar } from "../../../../logic/rollbar";
import { Alert } from "react-native";
import { Orders } from "../../../../logic/orders/orders";

type ApplyOrderActionProps = (action: (order: Order, args?: any) => Promise<any>,
                              errorTitle: string,
                              errorMessage: string,
                              args?: any) => Promise<boolean>

export const useOrderAction = (order: Order): [
  isProcessing: boolean,
  applyOrderAction: ApplyOrderActionProps
] => {
  const [orderActionInProgress, setOrderActionInProgress] = useRecoilState(orderActionInProgressState);
  const [isProcessing, setIsProcessing] = useState(false);

  const applyOrderAction: ApplyOrderActionProps = (action, errorTitle, errorMessage, args = undefined): Promise<boolean> => {
    if (settings.disableOrderActions) return Promise.resolve(false);
    setIsProcessing(true);

    return action(order, args)
      .then(loadOrder)
      .then(() => true)
      .catch(error => {
        rollbar.error(errorMessage, { ...sanitizeErrorForRollbar(error), order: order });
        Alert.alert(errorTitle, `${errorMessage}\n\n${error}.`);
        return false;
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  const loadOrder = () => Orders.fetchStatusForOrder(order)
    .then(updatedOrder => {
      updatedOrder.isProcessing = false;
      return updatedOrder;
    })
    .then(updatedOrder => {
      order.isProcessing = updatedOrder.isProcessing;
      order.status = updatedOrder.status;

      // Trigger GUI update
      setOrderActionInProgress(true);
      setOrderActionInProgress(false);
    });

  return [
    isProcessing,
    applyOrderAction,
  ];
};
