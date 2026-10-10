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

  const MockHeaders = (initialValues: { [key: string]: string; } = {}): Headers & { values: any } => {
    const values: { [key: string]: string } = { ...initialValues };
    const headers = {
      values,
      set(name: string, value: string) {
        values[name] = value;
      },
      append(name: string, value: string) {
        this.set(name, value);
      },
      delete(name: string) {
        delete values[name];
      },
      get(name: string) {
        const lower = name.toLowerCase();
        const matchKey = Object.keys(values).find(k => k.toLowerCase() === lower);
        return matchKey ? values[matchKey] : null;
      },
      has(name: string) {
        const lower = name.toLowerCase();
        return Object.keys(values).some(k => k.toLowerCase() === lower);
      },
      forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any) {
        Object.keys(values).forEach(key => callbackfn(values[key], key, headers as any));
      },
      get [Symbol.toStringTag]() {
        return "Headers";
      },
      entries() {
        throw new NotImplementedError();
      },
      keys() {
        throw new NotImplementedError();
      },
      values_() {
        throw new NotImplementedError();
      },
      [Symbol.iterator]() {
        throw new NotImplementedError();
      },
    };
    return headers as unknown as Headers & { values: any };
  };

  const defaultResponse = (status: number = 200): Response => ({
    ok: status >= 200 && status < 300,
    status: status,
    statusText: `${status}`,
    headers: MockHeaders({
      "X-XSRF-TOKEN": "demotoken=",
      "set-cookie": "XSRF-TOKEN=demotoken%3D; Path=/\nbloomable_session=demosession%3D; Path=/",
    }),
    redirected: false,
    type: "basic",
    url: "",
    clone() {
      throw new NotImplementedError();
    },
    body: null,
    bodyUsed: false,
    arrayBuffer() {
      throw new NotImplementedError();
    },
    blob() {
      throw new NotImplementedError();
    },
    formData() {
      throw new NotImplementedError();
    },
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
  } as unknown as Response);

  const originalFetch = fetch;

  export const setupDemoData = () => {
    console.debug("Using demo data");
    resetDemoOrders();

    const defaultDelay = process.env.NODE_ENV === "test" ? 5 : 500;
    const shortDelay = process.env.NODE_ENV === "test" ? 5 : 300;

    // @ts-ignore
    fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      const url = typeof input === "string" ? input : (input && (input as Request).url) || "";

      if (url === "https://dashboard.bloomable.com/api/me") {
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(demoResponseMe),
        }, defaultDelay);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/sanctum\/csrf-cookie$/i.test(url)) {
        return delayedPromiseWithValue(defaultResponse(HttpCode.NoContent), shortDelay);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/login$/i.test(url)) {
        return delayedPromiseWithValue(defaultResponse(HttpCode.OK), shortDelay);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/logout$/i.test(url)) {
        return delayedPromiseWithValue(defaultResponse(HttpCode.NoContent), shortDelay);

      } else if (/^https:\/\/dashboard\.bloomable\.com\/api\/order-line-reject-reasons$/i.test(url)) {
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(demoResponseRejectReasons),
        }, defaultDelay);

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
        }, defaultDelay);

      } else if (RegExp("^https://dashboard\\.bloomable\\.com/api/orders/([^/]+)/(accept|reject|fulfill|deliver)$", "i").test(url)) {
        const match = url.match(/^https:\/\/dashboard\.bloomable\.com\/api\/orders\/([^/]+)\/(accept|reject|fulfill|deliver)$/i);
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
        return delayedPromiseWithValue(defaultResponse(HttpCode.OK), defaultDelay);

      } else if (RegExp("^https://dashboard\\.bloomable\\.com/api/orders/([^/]+)$", "i").test(url)) {
        const match = url.match(/^https:\/\/dashboard\.bloomable\.com\/api\/orders\/([^/]+)$/i);
        const id = match ? match[1] : undefined;
        const order = getDemoOrders().find(it => it.id === id);
        if (!order) {
          return delayedPromiseWithValue({
            ...defaultResponse(404),
            ok: false,
            json: () => Promise.reject(new Error(`Order ${id} not found`)),
          }, defaultDelay);
        }
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve({ data: order }),
        }, defaultDelay);

      } else if (RegExp("^https://dashboard\\.bloomable\\.com/api/product-variants/(\\d+)$", "i").test(url)) {
        const match = url.match(/^https:\/\/dashboard\.bloomable\.com\/api\/product-variants\/(\\d+)$/i);
        const id = match ? +match[1] : 222;
        const product = demoResponseProduct[id] ?? demoResponseProduct[222];
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(product),
        }, defaultDelay);

      } else if (!/^https:\/\/dashboard\.bloomable\.com/i.test(url)) {
        return originalFetch(input, init);
      }

      console.warn("Couldn't find mock for", url, init);
      return originalFetch(input, init);
    };
  };

  export const tearDownDemoData = () => {
    (fetch as any) = originalFetch;
  };
}
