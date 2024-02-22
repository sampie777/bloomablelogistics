import { Orders } from "../../../../source/logic/orders/orders";
import { BloomableApi } from "../../../../source/logic/bloomable/api";
import Mock = jest.Mock;
import { BloomableOrder, OrdersResponse } from "../../../../source/logic/bloomable/serverModels";

jest.mock("bloomablelogistics/source/logic/bloomable/api.ts", () => {
  return {
    BloomableApi: {
      getOrders: jest.fn(),
    },
  };
});

describe("Test Orders.getAllOrders", () => {

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
    (BloomableApi.getOrders as Mock).mockClear();
  });

  it("loads one page if there's no data", async () => {
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [],
      meta: { ...emptyPageResponse.meta, last_page: 1 },
    });

    const result = await Orders.getOrdersWithStatus("open");
    expect(result.length).toBe(0);
  });

  it("loads one page if there's only one page", async () => {
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 1 },
    });

    const result = await Orders.getOrdersWithStatus("open");
    expect(result.length).toBe(1);
  });

  it("loads all available pages if there are multiple", async () => {
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 3 },
    });
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 3 },
    });
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 3 },
    });

    const result = await Orders.getOrdersWithStatus("open");
    expect(result.length).toBe(3);
  });

  it("loads all available pages until max_pages has been reached", async () => {
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 3 },
    });
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 3 },
    });
    (BloomableApi.getOrders as Mock).mockResolvedValueOnce({
      ...emptyPageResponse,
      data: [emptyOrder()],
      meta: { ...emptyPageResponse.meta, last_page: 3 },
    });

    const result = await Orders.getOrdersWithStatus("open", 2);
    expect(result.length).toBe(2);
  });
});
