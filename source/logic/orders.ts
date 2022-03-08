import server from "./bloomable/server";
import { ServerHtml } from "./bloomable/html";
import { config } from "./config";
import { emptyPromiseWithValue } from "./utils";
import { Order, Recipient } from "./models";

export namespace Orders {
  let fetchedOrders: Order[] = [];

  export const fetchPage = (page: number = 1): Promise<Order[]> => {
    if (config.offlineData) {
      const order1 = new Order();
      order1.id = "123456789";
      order1.number = 12345;
      order1.clientName = "Client name";
      order1.partner = "Partner";
      order1.florist = "Florist";
      order1.createdAt = new Date();
      order1.deliverAtDate = new Date();
      const order2 = new Order();
      order2.id = "123456709";
      order2.number = 456;
      order2.clientName = "Client name";
      order2.partner = "Partner";
      order2.florist = "Florist";
      order2.createdAt = new Date();
      order2.deliverAtDate = new Date();
      order2.deliverAtDate.setDate(8);

      return emptyPromiseWithValue([
        order1,
        order2,
      ]);
    }

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
      .then((order) => {
        orders = orders.filter(it => it !== nextOrder);
        orders.push(order);
        return fetchDetailsForOrders(orders);
      });
  };

  export const fetchDetailsForOrder = (order: Order): Promise<Order> => {
    if (!order.id) {
      return emptyPromiseWithValue(order);
    }
    if (order.recipient !== undefined) {
      return emptyPromiseWithValue(order);
    }

    if (config.offlineData) {
      const updatedOrder = Order.clone(order);
      updatedOrder.recipient = new Recipient();
      updatedOrder.recipient.name = "recipient name";
      updatedOrder.recipient.address = "the address";
      return emptyPromiseWithValue(updatedOrder);
    }

    return server.getOrderDetailsPage(order.id)
      .then((html: string) => {
        const { recipient, orderValue, products } = ServerHtml.orderDetailsResponseToOrderDetails(html);
        const updatedOrder = Order.clone(order);
        updatedOrder.recipient = recipient;
        updatedOrder.products = products;
        if (updatedOrder.orderValue === undefined) {
          updatedOrder.orderValue = orderValue;
        }
        return updatedOrder;
      });
  };

  export const sort = (orders: Order[]): Order[] =>
    orders
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .sort((a, b) => (b.delivered ? 1 : -1) - (a.delivered ? 1 : -1))
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
}
