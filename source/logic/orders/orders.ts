import { config } from "../../config";
import { emptyPromiseWithValue } from "../utils";
import { Order } from "./models";
import { BloomableApi } from "../bloomable/api";
import { Server } from "../bloomable/server";

export namespace Orders {
  export const list = (page: number = 1): Promise<Order[]> => {
    return BloomableApi.getOrders()
      .then(orders => sort(orders));
  };

  export const fetchDetailsForOrders = (orders: Order[]): Promise<Order[]> => {
    if (orders.length === 0) {
      return emptyPromiseWithValue(orders);
    }

    const nextOrder = orders.find(order => order.products.some(it => !it._detailsLoaded));
    if (nextOrder === undefined) {
      return emptyPromiseWithValue(orders);
    }

    return fetchDetailsForOrder(nextOrder)
      .then((order) => {
        orders = orders.filter(it => it !== nextOrder);
        orders.push(order);
        return fetchDetailsForOrders(orders);
      });
  };

  export const fetchDetailsForOrder = (order: Order): Promise<Order> => {
    if (order.products.every(it => it._detailsLoaded)) {
      return emptyPromiseWithValue(order);
    }

    return BloomableApi.loadOrderProducts(order)
      .then(() => order);
  };

  export const fetchStatusForOrder = (order: Order): Promise<Order> => {
    if (order.id == null) {
      return emptyPromiseWithValue(order);
    }

    return BloomableApi.getOrder({ id: order.id })
      .then(onlineOrder => {
        if (config.offlineData || Server.isDemoUser()) {
          if (!onlineOrder.accepted) {
            onlineOrder.accepted = true;
          } else {
            onlineOrder.delivered = true;
          }
        }

        onlineOrder.products = order.products;
        return onlineOrder;
      });
  };

  // Sort by order of importance (the later the sort, the more important the sort)
  export const sort = (orders: Order[]): Order[] =>
    orders
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .sort((a, b) => (b.delivered ? 1 : -1) - (a.delivered ? 1 : -1))
      .sort((a, b) => (b.deleted ? 1 : -1) - (a.deleted ? 1 : -1))
      .sort((a, b) => (b.accepted ? 1 : -1) - (a.accepted ? 1 : -1))
      .sort((a, b) => {
        if (a.deliverAtDate && b.deliverAtDate) {
          return a.deliverAtDate.getTime() - b.deliverAtDate.getTime();
        } else if (a.deliverAtDate) {
          return 1;
        } else if (b.deliverAtDate) {
          return -1;
        } else {
          return (a.number || 0) - (b.number || 0);
        }
      })
      .reverse();

  export const accept = (order: Order): Promise<any> => {
    if (!order.id) throw new Error("Order has no valid id");

    order.isAccepting = true;
    return Server.acceptOrder(order.id);
  };

  export const reject = (order: Order): Promise<any> => {
    if (!order.id) throw new Error("Order has no valid id");

    order.isRejecting = true;
    return Server.rejectOrder(order.id);
  };

  export const deliver = (order: Order): Promise<any> => {
    if (!order.id) throw new Error("Order has no valid id");

    order.isDelivering = true;
    return Server.deliverOrder(order.id);
  };
}
