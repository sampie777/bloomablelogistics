import server from "./bloomable/server";
import { ServerHtml } from "./bloomable/html";
import { config } from "./config";

export class Order {
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
}

export namespace Orders {
  let fetchedOrders: Order[] = [];

  export const fetchAll = (): Promise<Order[]> => {
    fetchedOrders = [];
    return sequentiallyFetchAll();
  };

  const sequentiallyFetchAll = (page: number = 1): Promise<Order[]> => {
    return server.getOrderPage(page)
      .then((html: string) => {
        fetchedOrders = fetchedOrders.concat(ServerHtml.ordersResponseToOrders(html));

        const hasNext = page < config.maxOrderPagesToFetch;
        if (hasNext) {
          return sequentiallyFetchAll(page + 1);
        }

        return fetchedOrders;
      });
  };

}
