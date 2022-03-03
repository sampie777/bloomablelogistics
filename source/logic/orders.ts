import server from "./bloomable/server";
import { ServerHtml } from "./bloomable/html";
import { config } from "./config";
import { emptyPromise, emptyPromiseWithValue } from "./utils";

export class Order {
  id: string | undefined;
  number: number | undefined;
  createdAt: Date | undefined;
  partner: string = "";
  clientName: string = "";
  clientEmail: string | undefined;
  clientPhones: string[] = [];
  deliverAtDate: Date | undefined;
  paymentType: string | undefined;
  florist: string | undefined;
  orderValue: number = 0;
  orderCosts: number = 0;
  accepted: boolean = false;
  delivered: boolean = false;
  deleted: boolean = false;
  recipient: Recipient | null | undefined;  // null when recipient not available, undefined when recipient not yet fetched
}

export class Recipient {
  name: string = "";
  phones: string[] = [];
  company: string = "";
  unit: string = "";
  address: string = "";
  message: string | undefined;
  specialInstructions: string | undefined;
}

export namespace Orders {
  let fetchedOrders: Order[] = [];

  export const fetchAll = (): Promise<Order[]> => {
    fetchedOrders = [];
    return sequentiallyFetchAll();
  };

  const sequentiallyFetchAll = (page: number = 1): Promise<Order[]> => {
    return server.getOrdersPage(page)
      .then((html: string) => {
        fetchedOrders = fetchedOrders.concat(ServerHtml.ordersResponseToOrders(html));

        const hasNext = page < config.maxOrderPagesToFetch;
        if (hasNext) {
          return sequentiallyFetchAll(page + 1);
        }

        return fetchDetailsForOrders(fetchedOrders);
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
        order.recipient = ServerHtml.orderDetailsResponseToRecipient(html);
      });
  };
}
