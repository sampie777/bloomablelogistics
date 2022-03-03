import server from "./bloomable/server";

export class Order {
  clientName: string = "";
}

export namespace Orders {
  let fetchedOrders: Order[] = [];

  export const fetchAll = (): Promise<Order[]> => {
    fetchedOrders = [];
    return sequentiallyFetchAll();
  };

  const sequentiallyFetchAll = (page: number = 0): Promise<Order[]> => {
    return server.getOrderPage(page)
      .then((html: string) => {
        fetchedOrders = fetchedOrders.concat(extractOrdersFromHtml(html));

        const hasNext = false;
        if (hasNext) {
          return sequentiallyFetchAll(page + 1);
        }

        return fetchedOrders;
      });
  };

  const extractOrdersFromHtml = (html: string): Order[] => {
    return [];
  };
}
