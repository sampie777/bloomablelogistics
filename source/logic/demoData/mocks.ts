import { delayedPromiseWithValue } from "../utils/utils";
import { HttpCode } from "../utils/http";
import { getDemoResponseOrders } from "./responses/orders";
import { demoResponseProduct } from "./responses/products";
import { demoResponseMe } from "./responses/me";
import { demoResponseRejectReasons } from "./responses/rejectReaons";
import { BloomableOrder, OrdersResponse } from "../bloomable/serverModels";

class NotImplementedError extends Error {
  name = "NotImplementedError";

  constructor() {
    super("Method not implemented");
  }
}

export namespace Mocks {
  let demoOrders: BloomableOrder[] = [];

  export const resetDemoOrders = () => {
    demoOrders = JSON.parse(JSON.stringify(getDemoResponseOrders().data));
  };

  export const getDemoOrders = (): BloomableOrder[] => {
    if (demoOrders.length === 0) {
      resetDemoOrders();
    }
    return demoOrders;
  };

  const MockHeaders = (values: { [key: string]: string; } = {}): Headers & { values: any } => ({
    values: values,
    set(name: string, value: string) {
      this.values[name] = value;
    },
    append(name: string, value: string) {
      this.set(name, value);
    },
    delete(name: string) {
      delete this.values[name];
    },
    get(name: string) {
      return this.values[name];
    },
    has(name: string) {
      return Object.keys(this.values).includes(name);
    },
    forEach(callback: Function, thisArg?: any) {
      throw new NotImplementedError();
    },
  });

  const defaultResponse = (status: number = HttpCode.OK): Response => {
    const headers = MockHeaders({
      "Set-Cookie": "XSRF-TOKEN=demotoken%3D; expires=Sat, 23 Sep 2030 11:01:07 GMT; Max-Age=7200; path=/; samesite=lax,bloomable_session=demosession%3D; expires=Sat, 23 Sep 2030 11:02:47 GMT; Max-Age=7200; path=/; httponly; samesite=lax",
    });
    return {
      headers: headers,
      ok: status >= 200 && status < 300,
      status: status,
      statusText: status === 200 ? "OK" : status === 204 ? "No Content" : status === 404 ? "Not Found" : `Status ${status}`,
      type: "default",
      url: "",
      redirected: false,

      bodyUsed: false,
      arrayBuffer: (): Promise<ArrayBuffer> => Promise.reject(new NotImplementedError()),
      blob: (): Promise<Blob> => Promise.reject(new NotImplementedError()),
      json: (): Promise<any> => Promise.resolve({}),
      text: (): Promise<string> => Promise.resolve(""),
      formData: (): Promise<FormData> => Promise.reject(new NotImplementedError()),
      clone: () => {
        throw new NotImplementedError();
      },
    };
  };

  const getOriginalFetch = () => {
    try {
      return fetch;
    } catch (_) {
      console.warn("Could not find default fetch() function. Ignore this warning if your are running tests.");
      return () => Promise.resolve(defaultResponse());
    }
  };

  const originalFetch = getOriginalFetch();

  export const tearDownDemoData = () => {
    // @ts-ignore
    fetch = originalFetch;
    demoOrders = [];
  };

  export const setupDemoData = () => {
    console.debug("Using demo data");
    resetDemoOrders();

    // @ts-ignore
    fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : (input && (input as Request).url) || "";

      if (url === "https://dashboard.bloomable.com/api/me") {
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(demoResponseMe),
        }, 500);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/sanctum\/csrf-cookie$/i.test(url)) {
        return delayedPromiseWithValue(defaultResponse(HttpCode.NoContent), 300);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/login$/i.test(url)) {
        return delayedPromiseWithValue(defaultResponse(HttpCode.OK), 300);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/logout$/i.test(url)) {
        return delayedPromiseWithValue(defaultResponse(HttpCode.NoContent), 300);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/order-line-reject-reasons$/i.test(url)) {
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(demoResponseRejectReasons),
        }, 500);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/orders(\?.*)?$/i.test(url)) {
        const pageMatch = url.match(/[?&]page=(\d+)/);
        const page = pageMatch ? parseInt(pageMatch[1], 10) : 1;
        const filterMatch = url.match(/[?&]filter=([^&#]+)/);
        const filter = filterMatch ? decodeURIComponent(filterMatch[1]) : undefined;

        const currentOrders = getDemoOrders();
        const filtered = filter && filter !== "all"
          ? currentOrders.filter(it => it.status === filter)
          : currentOrders;

        const perPage = 15;
        const total = filtered.length;
        const lastPage = Math.max(1, Math.ceil(total / perPage));
        const startIndex = (page - 1) * perPage;
        const pageData = filtered.slice(startIndex, startIndex + perPage);

        const ordersResponse: OrdersResponse = {
          data: pageData,
          links: {
            first: "https://dashboard.bloomable.com/api/orders?page=1",
            last: `https://dashboard.bloomable.com/api/orders?page=${lastPage}`,
            prev: page > 1 ? `https://dashboard.bloomable.com/api/orders?page=${page - 1}` : null,
            next: page < lastPage ? `https://dashboard.bloomable.com/api/orders?page=${page + 1}` : null,
          },
          meta: {
            current_page: page,
            from: total === 0 ? null : startIndex + 1,
            last_page: lastPage,
            links: [
              { url: page > 1 ? `https://dashboard.bloomable.com/api/orders?page=${page - 1}` : null, label: "&laquo; Previous", active: false },
              { url: `https://dashboard.bloomable.com/api/orders?page=${page}`, label: `${page}`, active: true },
              { url: page < lastPage ? `https://dashboard.bloomable.com/api/orders?page=${page + 1}` : null, label: "Next &raquo;", active: false },
            ],
            path: "https://dashboard.bloomable.com/api/orders",
            per_page: perPage,
            to: total === 0 ? null : Math.min(startIndex + perPage, total),
            total: total,
          },
        };

        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(ordersResponse),
        }, 500);

      } else if (RegExp("^https://dashboard\\.bloomable\\.com/api/orders/(\\d+)/(accept|reject|fulfill|deliver)$", "i").test(url)) {
        const match = url.match(/^https:\/\/dashboard\.bloomable\.com\/api\/orders\/(\d+)\/(accept|reject|fulfill|deliver)$/i);
        if (match) {
          const id = match[1];
          const action = match[2].toLowerCase();
          const order = getDemoOrders().find(it => it.id === id);
          if (order) {
            if (action === "accept") {
              order.status = "accepted";
            } else if (action === "reject") {
              order.status = "cancelled";
            } else if (action === "fulfill") {
              order.status = "fulfilled";
            } else if (action === "deliver") {
              order.status = "delivered";
            }
            order.lines.forEach(line => {
              line.status = order.status;
            });
          }
        }
        return delayedPromiseWithValue(defaultResponse(HttpCode.OK), 500);

      } else if (RegExp("^https://dashboard\\.bloomable\\.com/api/orders/(\\d+)$", "i").test(url)) {
        const match = url.match(/^https:\/\/dashboard\.bloomable\.com\/api\/orders\/(\d+)$/i);
        const id = match ? match[1] : undefined;
        const order = getDemoOrders().find(it => it.id === id);
        if (!order) {
          return delayedPromiseWithValue({
            ...defaultResponse(404),
            ok: false,
            json: () => Promise.reject(new Error(`Order ${id} not found`)),
          }, 500);
        }
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve({ data: order }),
        }, 500);

      } else if (RegExp("^https://dashboard\\.bloomable\\.com/api/product-variants/(\\d+)$", "i").test(url)) {
        const match = url.match(/^https:\/\/dashboard\.bloomable\.com\/api\/product-variants\/(\d+)$/i);
        const id = match ? +match[1] : 222;
        const product = demoResponseProduct[id] ?? demoResponseProduct[222];
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(product),
        }, 500);

      } else if (!/^https:\/\/dashboard\.bloomable\.com/i.test(url)) {
        return originalFetch(input, init);
      }

      console.warn("Couldn't find mock for", url, init);
      return originalFetch(input, init);
    };
  };
}
