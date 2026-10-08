import { Orders } from "../../../../source/logic/orders/orders";
import { BloomableApi } from "../../../../source/logic/bloomable/api";
import Mock = jest.Mock;
import { BloomableOrder, OrdersResponse, OrderStatus } from "../../../../source/logic/bloomable/serverModels";
import { settings } from "../../../../source/logic/settings/settings";

jest.mock("bloomablelogistics/source/logic/bloomable/api.ts", () => {
  return {
    BloomableApi: {
      getOrders: jest.fn(),
    },
  };
});

describe("Test Orders.list", () => {

  const emptyPageResponse: OrdersResponse = {
    data: [],
    links: {
      first: "",
      last: "",
      prev: null,
      next: null,
    },
    meta: {
      current_page: 1,
      from: null,
      last_page: 1,
      links: [],
      path: "",
      per_page: 15,
      to: null,
      total: 0,
    },
  };

  const emptyOrder = (): BloomableOrder => ({
    id: "string",
    name: "string",
    firstName: "string",
    lastName: "string",
    company: null,
    phone: null,
    address1: "string",
    address2: null,
    postalCode: null,
    city: "string",
    country: "string",
    latitude: 0,
    longitude: 0,
    created_at: "2024-02-21T14:00:00+00:00",
    deliveryDate: "2024-02-21T14:00:00+00:00",
    lines: [],
    adjustments: [],
    status: "open",
    notes: null,
    totalValue: 0,
    onPay: 0,
    deliveryFee: "string",
  });

  beforeEach(() => {
    (BloomableApi.getOrders as Mock).mockReset();
  });

  it("returns all orders for each status", async () => {
    settings.maxPastOrderPagesToFetch = 2;

    (BloomableApi.getOrders as Mock).mockImplementation((page = 1, withStatus: OrderStatus | "all" = "all"): Promise<OrdersResponse> => {
      switch (withStatus) {
        case "open":
          return Promise.resolve({
            ...emptyPageResponse,
            data: [{ ...emptyOrder(), status: "open" }],
            meta: { ...emptyPageResponse.meta, last_page: 2 },
          });
        case "accepted":
          return Promise.resolve({
            ...emptyPageResponse,
            data: [{ ...emptyOrder(), status: "accepted" }, { ...emptyOrder(), status: "accepted" }],
            meta: { ...emptyPageResponse.meta, last_page: 1 },
          });
        case "fulfilled":
          return Promise.resolve({
            ...emptyPageResponse,
            data: [{ ...emptyOrder(), status: "fulfilled" }],
            meta: { ...emptyPageResponse.meta, last_page: 2 },
          });
        case "delivered":
          return Promise.resolve({
            ...emptyPageResponse,
            data: [{ ...emptyOrder(), status: "delivered" }],
            meta: { ...emptyPageResponse.meta, last_page: 3 },
          });
        case "cancelled":
          return Promise.resolve({
            ...emptyPageResponse,
            data: [{ ...emptyOrder(), status: "cancelled" }],
            meta: { ...emptyPageResponse.meta, last_page: 2 },
          });
        case "cancel-confirmed":
          return Promise.resolve({
            ...emptyPageResponse,
            data: [{ ...emptyOrder(), status: "cancel-confirmed" }],
            meta: { ...emptyPageResponse.meta, last_page: 2 },
          });
        default:
          throw Error("Unhandled branch");
      }
    });

    const result = await Orders.list();
    expect(result.length).toBe(9);
    expect(result[0].status).toBe("open");
    expect(result[1].status).toBe("open");
    expect(result[2].status).toBe("accepted");
    expect(result[3].status).toBe("accepted");
    expect(result[4].status).toBe("fulfilled");
    expect(result[5].status).toBe("fulfilled");
    expect(result[6].status).toBe("delivered");
    expect(result[7].status).toBe("delivered");
    expect(result[8].status).toBe("cancel-confirmed");
  });
});
