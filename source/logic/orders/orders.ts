import { emptyPromiseWithValue } from "../utils/utils";
import { Order } from "./models";
import { BloomableApi } from "../bloomable/api";
import { Server } from "../bloomable/server";
import { Status } from "./status";
import { settings } from "../settings/settings";
import { convertToLocalOrders } from "../bloomable/converter";
import { OrderStatus } from "../bloomable/serverModels";

export namespace Orders {
  export const list = async (
    onBatch?: (accumulatedOrders: Order[], completedCount: number, totalCount: number, pendingStatuses: OrderStatus[]) => void,
  ): Promise<Order[]> => {
    const totalCount = 5;
    let completedCount = 0;
    const accumulatedOrdersMap = new Map<string, Order>();

    const statusQueries: { status: OrderStatus; maxPages?: number }[] = [
      { status: "open" },
      { status: "accepted" },
      { status: "fulfilled" },
      { status: "delivered", maxPages: settings.maxPastOrderPagesToFetch },
      { status: "cancel-confirmed", maxPages: 1 },
    ];

    const pendingStatuses = new Set<OrderStatus>(statusQueries.map(q => q.status));

    const wrappedPromises = statusQueries.map(({ status, maxPages }) =>
      getOrdersWithStatus(status, maxPages).then(batchOrders => {
        completedCount++;
        pendingStatuses.delete(status);
        for (const order of batchOrders) {
          if (order.id) {
            accumulatedOrdersMap.set(order.id, order);
          }
        }
        if (onBatch) {
          const currentList = sort(Array.from(accumulatedOrdersMap.values()));
          onBatch(currentList, completedCount, totalCount, Array.from(pendingStatuses));
        }
        return batchOrders;
      }),
    );

    const pages = await Promise.all(wrappedPromises);
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

  export const fetchDetailsForOrders = async (orders: Order[], concurrency = 4): Promise<Order[]> => {
    if (!Server.isLoggedIn() || orders.length === 0) {
      return emptyPromiseWithValue(orders);
    }

    const ordersToLoad = orders.filter(order => order.products.some(it => !it._detailsLoaded));
    if (ordersToLoad.length === 0) {
      return emptyPromiseWithValue(orders);
    }

    for (let i = 0; i < ordersToLoad.length; i += concurrency) {
      if (!Server.isLoggedIn()) break;
      const chunk = ordersToLoad.slice(i, i + concurrency);
      await Promise.all(chunk.map(order => fetchDetailsForOrder(order)));
    }

    return orders;
  };

  export const fetchDetailsForOrder = (order: Order): Promise<Order> => {
    if (!Server.isLoggedIn() || order.products.every(it => it._detailsLoaded)) {
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

  export const recipientName = (order: Order): string =>
    order.recipient.name.length > 0 ? order.recipient.name : (order.recipient.company || "");
}
