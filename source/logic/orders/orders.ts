import { emptyPromiseWithValue } from "../utils/utils";
import { Order } from "./models";
import { BloomableApi } from "../bloomable/api";
import { Server } from "../bloomable/server";
import { Status } from "./status";
import { settings } from "../settings/settings";
import { convertToLocalOrders } from "../bloomable/converter";
import { OrderStatus } from "../bloomable/serverModels";

export namespace Orders {
  export const list = async (): Promise<Order[]> => {
    // Parallel fetch orders
    const pages = await Promise.all(
      [
        getOrdersWithStatus("open"),
        getOrdersWithStatus("accepted"),
        getOrdersWithStatus("fulfilled"),
        getOrdersWithStatus("delivered", settings.maxPastOrderPagesToFetch),
        getOrdersWithStatus("cancel-confirmed", 1),
      ],
    );
    return sort(pages.flatMap(it => it));
  };

  export const getOrdersWithStatus = async (withStatus: OrderStatus, maxPages?: number, _currentPage = 0): Promise<Order[]> => {
    if (maxPages != undefined && maxPages <= 0) return Promise.resolve([]);

    try {
      const page = await BloomableApi.getOrders(_currentPage + 1, withStatus);
      const orders = convertToLocalOrders(page.data);

      if (_currentPage + 1 >= page.meta.last_page || (maxPages !== undefined && _currentPage + 1 >= maxPages)) {
        return orders;
      }

      return [...orders, ...await getOrdersWithStatus(withStatus, maxPages, _currentPage + 1)];
    } catch (error) {
      throw Error(`Failed to get orders with status ${withStatus}.\n\n${error}`);
    }
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
        if (Server.isDemoUser()) {
          if (order.status === "open") {
            onlineOrder.status = "accepted";
          } else if (order.status === "accepted") {
            onlineOrder.status = "fulfilled";
          } else if (order.status === "fulfilled") {
            onlineOrder.status = "delivered";
          } else {
            onlineOrder.status = "cancelled";
          }
        }

        onlineOrder.products = order.products;
        return onlineOrder;
      });
  };

  export const checkIsDeleted = (order: Order): Promise<boolean> => {
    if (order.id == null) {
      return Promise.resolve(false);
    }

    return BloomableApi.doesOrderExists({ id: order.id })
      .then(doesExist => !doesExist);
  };

  // Sort by order of importance (the later the sort, the more important the sort)
  export const sort = (orders: Order[]): Order[] =>
    orders
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .sort((a, b) => Status.sortValueForStatus(b.status) - Status.sortValueForStatus(a.status))
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

    order.isProcessing = true;
    return Server.acceptOrder(order.id);
  };

  export const reject = (order: Order, reason: string): Promise<any> => {
    if (!order.id) return Promise.reject(new Error("Order has no valid id"));

    order.isProcessing = true;
    return Server.rejectOrder(order.id, reason);
  };

  export const fulfill = (order: Order): Promise<any> => {
    if (!order.id) throw new Error("Order has no valid id");

    order.isProcessing = true;
    return Server.fulfillOrder(order.id);
  };

  export const deliver = (order: Order): Promise<any> => {
    if (!order.id) throw new Error("Order has no valid id");

    order.isProcessing = true;
    return Server.deliverOrder(order.id);
  };

  export const recipientName = (order: Order) => order.recipient.name.length > 0 ? order.recipient.name : order.recipient.company;
}
