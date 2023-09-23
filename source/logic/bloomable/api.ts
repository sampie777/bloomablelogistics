import { Order, Product } from "../orders/models";
import { MeResponse, OrderResponse, OrdersResponse, OrderStatus, ProductResponse } from "./serverModels";
import { convertToLocalOrder, convertToLocalOrders, convertToLocalProduct } from "./converter";
import { BloomableAuth } from "./auth";
import { rollbar } from "../rollbar";
import { Server } from "./server";

export namespace BloomableApi {
  export const getOrders = (withStatus: OrderStatus | "all" = "all",
                            credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<Order[]> => {
    return BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders?page=1&s=created_at&d=desc${withStatus === "all" ? "" : `&filter=${withStatus}`}`,
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
      })
      .then(response => response.json() as Promise<OrdersResponse | undefined>)
      .then(json => {
        if (json === undefined || json.data === undefined || !Array.isArray(json.data)) {
          throw new Error(`Response for getOrders is not the expected array but '${JSON.stringify(json)}'`);
        }
        return convertToLocalOrders(json.data);
      })
      .catch(e => {
        rollbar.error("Could not get orders", { error: e });
        throw e;
      });
  };

  export const getOrder = (order: { id: string },
                           credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<Order> => {
    return BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}`,
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
      })
      .then(response => response.json() as Promise<OrderResponse>)
      .then(json => convertToLocalOrder(json.data))
      .catch(e => {
        rollbar.error("Could not get order", {
          error: e,
          order: order,
        });
        throw e;
      });
  };

  export const getProduct = (product: { id: number },
                             credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<Product> => {
    return BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/product-variants/${product.id}`,
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
      })
      .then(response => response.json() as Promise<ProductResponse>)
      .then(json => convertToLocalProduct(json.data))
      .catch(e => {
        rollbar.error("Could not get product", { error: e, product: product });
        throw e;
      });
  };

  export const acceptOrder = (order: { id: string },
                              credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> => {
    return BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}/accept`,
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
        method: "POST",
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Failed to accept order (status=${response.status})`);
        }
      })
      .catch(e => {
        rollbar.error("Could not accept order", { error: e, order: order });
        throw e;
      });
  };

  // Not tested
  export const rejectOrder = (order: { id: string },
                              credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> => {
    return BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}/reject`,
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
        method: "POST",
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Failed to reject order (status=${response.status})`);
        }
      })
      .catch(e => {
        rollbar.error("Could not reject order", { error: e, order: order });
        throw e;
      });
  };

  // Not tested
  export const deliverOrder = (order: { id: string },
                               credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<any> => {
    return BloomableAuth.authenticatedFetch(credentials,
      `https://dashboard.bloomable.com/api/orders/${order.id}/deliver`,
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
        method: "POST",
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Failed to deliver order (status=${response.status})`);
        }
      })
      .catch(e => {
        rollbar.error("Could not deliver order", { error: e, order: order });
        throw e;
      });
  };

  export const getProfile = (credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<MeResponse> => {
    return BloomableAuth.authenticatedFetch(credentials,
      "https://dashboard.bloomable.com/api/me",
      {
        headers: {
          "Accept": "application/json",
          "Referer": "https://dashboard.bloomable.com/dashboard",
        },
      })
      .then(response => response.json())
      .catch(e => {
        rollbar.error("Could not get me details", { error: e });
        throw e;
      });
  };

  export const loadOrderProducts = (order: Order,
                                    credentials: BloomableAuth.Credentials = Server.getCredentials()): Promise<unknown> => {
    return Promise.all(order.products.map(product =>
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
  };
}
