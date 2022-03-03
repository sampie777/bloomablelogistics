import server from "./bloomable/server";
import { ServerHtml } from "./bloomable/html";

export class Order {
  number: number | undefined;
  createdAt: Date | undefined;
  partner: string = "";
  clientName: string = "";
  clientEmail: string | undefined;
  clientPhones: string[] = [];
  deliverAt: Date | undefined;
  paymentType: string | undefined;
  florist: string | undefined;
  orderValue: number = 0;
  orderCosts: number = 0;
  accepted: boolean | undefined;
  delivered: boolean | undefined;
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

        const hasNext = false;
        if (hasNext) {
          return sequentiallyFetchAll(page + 1);
        }

        return fetchedOrders;
      });
  };

}
