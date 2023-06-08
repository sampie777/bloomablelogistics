import React, { useEffect } from "react";
import { Orders } from "../../logic/orders";
import { useRecoilState, useRecoilValue } from "recoil";
import { ordersState, selectedDateOrdersState } from "../../logic/recoil";

interface Props {

}

const OrderDetailsLoader: React.FC<Props> = () => {
  const [allOrders, setAllOrders] = useRecoilState(ordersState);
  const selectedOrders = useRecoilValue(selectedDateOrdersState);

  useEffect(() => {
    loadDetails();
  }, [selectedOrders]);

  const loadDetails = () => {

    if (!selectedOrders.some(it => it.recipient === undefined)) {
      return;
    }

    Orders.fetchDetailsForOrders(selectedOrders)
      .then((updatedOrders) => {
        const newOrders = allOrders.map(it => {
          const updatedOrder = updatedOrders.find(order => order.id === it.id && order.number === it.number);
          if (updatedOrder !== undefined) {
            return updatedOrder;
          }
          return it;
        });
        setAllOrders(newOrders);
      });
  };

  return null;
};

export default OrderDetailsLoader;
