import { Order, Product } from "../orders/models";
import { MeResponse, OrderResponse, OrdersResponse, OrderStatus, ProductResponse } from "./serverModels";
import { convertToLocalOrder, convertToLocalProduct } from "./converter";
import { BloomableAuth } from "./auth";
import { rollbar, sanitizeErrorForRollbar } from "../rollbar";
import { Server } from "./server";

export namespace BloomableApi {
  const jsonHeaders = {
    "Accept": "application/json",
    "Referer": "https://dashboard.bloomable.com/dashboard",
  };

  export const getRejectReasons = (credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<string[]> =>
    BloomableAuth.authenticatedFetch(credentials,
      "https://dashboard.bloomable.com/api/order-line-reject-reasons",
      { headers: jsonHeaders })
      .then(response => response.json() as Promise<string[]>)
      .then(data => {
        if (data === undefined || !Array.isArray(data)) {
          throw new Error(`Response for getRejectReasons is not the expected array but '${JSON.stringify(data)}'`);
        }
        return data;
      })
      .catch(error => {
        rollbar.error("Could not get reject reasons", sanitizeErrorForRollbar(error));
        throw error;
      });

  export const getOrders = (page = 1,
                            withStatus: OrderStatus | "all" = "all",
                            credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<OrdersResponse> =>
    BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders?page=${page}&s=created_at&d=desc${withStatus === "all" ? "" : `&filter=${withStatus}`}`,
      { headers: jsonHeaders })
      .then(response => response.json() as Promise<OrdersResponse | undefined>)
      .then(json => {
        if (json === undefined || json.data === undefined || !Array.isArray(json.data)) {
          throw new Error(`Response for getOrders is not the expected array but '${JSON.stringify(json)}'`);
        }
        return json;
      })
      .catch(error => {
        rollbar.error("Could not get orders", {
          ...sanitizeErrorForRollbar(error),
          page: page,
          withStatus: withStatus,
        });
        throw error;
      });

  export const getOrder = (order: { id: string },
                           credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<Order> =>
    BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}`, { headers: jsonHeaders })
      .then(response => response.json() as Promise<OrderResponse>)
      .then(json => convertToLocalOrder(json.data))
      .catch(error => {
        rollbar.error("Could not get order", {
          ...sanitizeErrorForRollbar(error),
          order: order,
        });
        throw error;
      });

  export const doesOrderExists = (order: { id: string },
                                  credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<boolean> =>
    BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}`, { headers: jsonHeaders })
      .then(response => response.json() as Promise<OrderResponse>)
      .then(() => true)
      .catch(() => false);

  export const getProduct = (product: { id: number },
                             credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<Product> =>
    BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/product-variants/${product.id}`, { headers: jsonHeaders })
      .then(response => response.json() as Promise<ProductResponse>)
      .then(json => convertToLocalProduct(json.data))
      .catch(error => {
        rollbar.error("Could not get product", {
          ...sanitizeErrorForRollbar(error),
          product: product,
        });
        throw error;
      });

  const callApiWithAction = (credentials: BloomableAuth.Credentials,
                             order: { id: string },
                             action: "accept" | "reject" | "fulfill" | "deliver") =>
    BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}/${action}`,
      {
        headers: jsonHeaders,
        method: "POST",
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Failed to ${action} order (status=${response.status})`);
        }
      })
      .catch(error => {
        rollbar.error(`Could not ${action} order`, {
          ...sanitizeErrorForRollbar(error),
          order: order,
        });
        throw error;
      });

  export const acceptOrder = (order: { id: string },
                              credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> =>
    callApiWithAction(credentials, order, "accept");

  // Not tested
  export const rejectOrder = (order: { id: string },
                              reason: string,
                              credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> =>
    BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}/reject`,
      {
        headers: {
          ...jsonHeaders,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ reason: reason }),
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Failed to reject order (status=${response.status})`);
        }
      })
      .catch(error => {
        rollbar.error(`Could not reject order`, {
          ...sanitizeErrorForRollbar(error),
          order: order,
          reason: reason,
        });
        throw error;
      });

  export const fulfillOrder = (order: { id: string },
                               credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> =>
    callApiWithAction(credentials, order, "fulfill");

  export const deliverOrder = (order: { id: string },
                               credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> =>
    callApiWithAction(credentials, order, "deliver");

  export const getProfile = (credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<MeResponse> =>
    BloomableAuth.authenticatedFetch(credentials,
      "https://dashboard.bloomable.com/api/me", { headers: jsonHeaders })
      .then(response => response.json())
      .catch(error => {
        rollbar.error("Could not get me details", sanitizeErrorForRollbar(error));
        throw error;
      });

  export const loadOrderProducts = (order: Order,
                                    credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<unknown> =>
    Promise.all(order.products.map(product =>
      getProduct(product, credentials)
        .then(it => {
          product.name = it.name;
          product.size = it.size;
          product.description = it.description;
          product.guidelines = it.guidelines;
          product.image = it.image;
          product.extras = it.extras;
          product._detailsLoaded = true;
        }),
    ));
}
