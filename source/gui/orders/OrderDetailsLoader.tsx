import React, { useEffect, useRef } from "react";
import { Orders } from "../../logic/orders/orders";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  ordersState,
  selectedDateOrdersState,
  selectedDateState,
} from "../../logic/recoil";
import { Server } from "../../logic/bloomable/server";
import { isToday, isTomorrow } from "../../logic/utils/utils";

interface Props {}

const OrderDetailsLoader: React.FC<Props> = () => {
  const [allOrders, setAllOrders] = useRecoilState(ordersState);
  const selectedDate = useRecoilValue(selectedDateState);
  const selectedOrders = useRecoilValue(selectedDateOrdersState);
  const isLoadingRef = useRef(false);
  const loadedOrderIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    loadDetails();
  }, [selectedOrders, selectedDate]);

  const loadDetails = () => {
    if (!Server.isLoggedIn() || isLoadingRef.current) {
      return;
    }

    const now = new Date();
    // Only eagerly preload if viewing today or tomorrow
    const isSnappyDay = isToday(now, selectedDate) || isTomorrow(now, selectedDate);
    if (!isSnappyDay) {
      return;
    }

    const ordersNeedingDetails = selectedOrders.filter(order =>
      order.id &&
      !loadedOrderIdsRef.current.has(order.id) &&
      order.deliverAtDate &&
      (isToday(now, order.deliverAtDate) || isTomorrow(now, order.deliverAtDate)) &&
      order.products.some(it => !it._detailsLoaded)
    );

    if (ordersNeedingDetails.length === 0) {
      return;
    }

    ordersNeedingDetails.forEach(o => {
      if (o.id) loadedOrderIdsRef.current.add(o.id);
    });

    isLoadingRef.current = true;
    Orders.fetchDetailsForOrders(ordersNeedingDetails)
      .then((updatedOrders) => {
        if (!Server.isLoggedIn()) {
          return;
        }
        setAllOrders(prevOrders => prevOrders.map(it => {
          const updatedOrder = updatedOrders.find(order => order.id === it.id);
          if (updatedOrder !== undefined) {
            return { ...updatedOrder, products: [...updatedOrder.products] };
          }
          return it;
        }));
      })
      .catch(() => {
        // Prevent unhandled promise rejection
      })
      .finally(() => {
        isLoadingRef.current = false;
      });
  };

  return null;
};

export default OrderDetailsLoader;
