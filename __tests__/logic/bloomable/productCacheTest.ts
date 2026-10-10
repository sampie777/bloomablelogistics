import { ProductCache } from "../../../source/logic/bloomable/productCache";
import { Product } from "../../../source/logic/orders/models";
import { BloomableApi } from "../../../source/logic/bloomable/api";
import { Server } from "../../../source/logic/bloomable/server";
import { Orders } from "../../../source/logic/orders/orders";

describe("ProductCache and Order Details Loading", () => {
  beforeEach(() => {
    ProductCache.clear();
  });

  afterEach(() => {
    ProductCache.clear();
  });

  it("stores and retrieves cached products", () => {
    const mockProduct: Product = {
      id: 123,
      name: "Sunflower Bouquet",
      size: "Medium",
      retailPrice: 250,
      _detailsLoaded: true,
    };

    expect(ProductCache.has(123)).toBe(false);
    expect(ProductCache.get(123)).toBeUndefined();

    ProductCache.set(123, mockProduct);

    expect(ProductCache.has(123)).toBe(true);
    expect(ProductCache.get(123)).toEqual(mockProduct);

    ProductCache.clear();
    expect(ProductCache.has(123)).toBe(false);
    expect(ProductCache.get(123)).toBeUndefined();
  });

  it("clears product cache when Server.logout() is called", async () => {
    const mockProduct: Product = {
      id: 456,
      name: "Rose Arrangement",
      size: "Large",
      retailPrice: 500,
      _detailsLoaded: true,
    };

    ProductCache.set(456, mockProduct);
    expect(ProductCache.has(456)).toBe(true);

    await Server.logout();
    expect(ProductCache.has(456)).toBe(false);
  });

  it("fetchDetailsForOrders loads orders concurrently in batches", async () => {
    const orders = [
      {
        id: "1",
        number: 101,
        deliverAtDate: new Date(),
        products: [{ id: 1, name: "Item 1", _detailsLoaded: false }],
        recipient: { name: "Alice", phones: [] },
        status: "open" as const,
      },
      {
        id: "2",
        number: 102,
        deliverAtDate: new Date(),
        products: [{ id: 2, name: "Item 2", _detailsLoaded: false }],
        recipient: { name: "Bob", phones: [] },
        status: "open" as const,
      },
    ];

    const spy = jest.spyOn(BloomableApi, "loadOrderProducts").mockImplementation(async (order) => {
      order.products.forEach(p => { p._detailsLoaded = true; });
    });

    // Mock logged in state
    jest.spyOn(Server, "isLoggedIn").mockReturnValue(true);

    const result = await Orders.fetchDetailsForOrders(orders as any, 2);
    expect(result.length).toBe(2);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(orders[0].products[0]._detailsLoaded).toBe(true);
    expect(orders[1].products[0]._detailsLoaded).toBe(true);

    spy.mockRestore();
  });
});
