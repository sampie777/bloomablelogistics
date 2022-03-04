import server from "./bloomable/server";
import { ServerHtml } from "./bloomable/html";
import { config } from "./config";
import { emptyPromise, emptyPromiseWithValue } from "./utils";
import { Order } from "./models";

export namespace Orders {
  let fetchedOrders: Order[] = [];

  export const fetchPage = (page: number = 1): Promise<Order[]> => {
    return server.getOrdersPage(page)
      .then((html: string) => {
        return ServerHtml.ordersResponseToOrders(html);
      });
  };

  export const fetchAll = (): Promise<Order[]> => {
    fetchedOrders = [];
    return sequentiallyFetchAll();
  };

  const sequentiallyFetchAll = (page: number = 1): Promise<Order[]> => {
    return fetchPage(page)
      .then((orders: Order[]) => {
        fetchedOrders = fetchedOrders.concat(orders);

        const hasNext = page < config.maxOrderPagesToFetch;
        if (hasNext) {
          return sequentiallyFetchAll(page + 1);
        }

        return fetchedOrders;
      });
  };

  export const fetchDetailsForOrders = (orders: Order[]): Promise<Order[]> => {
    if (orders.length === 0) {
      return emptyPromiseWithValue(orders);
    }

    const nextOrder = orders.find(it => it.recipient === undefined);
    if (nextOrder === undefined) {
      return emptyPromiseWithValue(orders);
    }

    return fetchDetailsForOrder(nextOrder)
      .then(() => fetchDetailsForOrders(orders));
  };

  export const fetchDetailsForOrder = (order: Order) => {
    if (!order.id) {
      return emptyPromise();
    }
    return server.getOrderDetailsPage(order.id)
      .then((html: string) => {
        const { recipient, orderValue } = ServerHtml.orderDetailsResponseToRecipient(html);
        order.recipient = recipient;
        if (order.orderValue === undefined) {
          order.orderValue = orderValue;
        }
      });
  };
}
