import { delayedPromiseWithValue } from "../utils";
import { HttpCode } from "../utils/http";
import { demoResponseOrders } from "./responses/orders";
import { demoResponseProduct } from "./responses/products";
import { demoResponseMe } from "./responses/me";

class NotImplementedError extends Error {
  name = "NotImplementedError";

  constructor() {
    super("Method not implemented");
  }
}

export namespace Mocks {
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

  const defaultResponse = (): Response => {
    const headers = MockHeaders({ "Set-Cookie": "XSRF-TOKEN=demotoken%3D; expires=Sat, 23 Sep 2023 11:01:07 GMT; Max-Age=7200; path=/; samesite=lax,bloomable_session=demosession%3D; expires=Sat, 23 Sep 2023 11:02:47 GMT; Max-Age=7200; path=/; httponly; samesite=lax" });
    return {
      headers: headers,
      ok: true,
      status: HttpCode.OK,
      statusText: "OK",
      type: "default",
      url: "",
      redirected: false,

      bodyUsed: false,
      arrayBuffer: (): Promise<ArrayBuffer> => Promise.reject(new NotImplementedError()),
      blob: (): Promise<Blob> => Promise.reject(new NotImplementedError()),
      json: (): Promise<any> => Promise.reject(new NotImplementedError()),
      text: (): Promise<string> => Promise.reject(new NotImplementedError()),
      formData: (): Promise<FormData> => Promise.reject(new NotImplementedError()),
      clone: () => {
        throw new NotImplementedError();
      },
    };
  };

  const originalFetch = fetch;

  export const setupDemoData = () => {
    console.debug("Using demo data");

    // @ts-ignore
    fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
      if (input === "https://dashboard.bloomable.com/api/me") {
        return delayedPromiseWithValue({ ...defaultResponse(), json: () => Promise.resolve(demoResponseMe) }, 500);

      } else if (input === "https://dashboard.bloomable.com/api/orders?page=1&s=created_at&d=desc") {
        return delayedPromiseWithValue({ ...defaultResponse(), json: () => Promise.resolve(demoResponseOrders) }, 500);

      } else if (typeof (input) === "string" && RegExp("https://dashboard.bloomable.com/api/product-variants/\\d+$", "gi").test(input)) {
        const id = +Array.from(input.matchAll(RegExp("https://dashboard.bloomable.com/api/product-variants/(\\d+)$", "gi")))[0][1];
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve(demoResponseProduct[id]),
        }, 500);

      } else if (typeof (input) === "string" && RegExp("https://dashboard.bloomable.com/api/orders/\\d+$", "gi").test(input)) {
        const id = Array.from(input.matchAll(RegExp("https://dashboard.bloomable.com/api/orders/(\\d+)$", "gi")))[0][1];
        const order = demoResponseOrders.data.find(it => it.id === id);
        return delayedPromiseWithValue({
          ...defaultResponse(),
          json: () => Promise.resolve({ data: order }),
        }, 500);

      } else if (typeof (input) === "string" && RegExp("https://dashboard.bloomable.com/api/orders/\\d+/(accept|reject|fulfill|deliver)$", "gi").test(input)) {
        return delayedPromiseWithValue(defaultResponse(), 500);

      } else if (typeof (input) === "string" && !RegExp("https://dashboard.bloomable.com.*$").test(input)) {
        return originalFetch(input, init);
      }

      console.warn("Couldn't find mock for", input, init);
      return originalFetch(input, init);
    };
  };
}
