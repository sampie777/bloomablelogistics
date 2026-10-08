import { Mocks } from "../../../source/logic/demoData/mocks";
import { Server } from "../../../source/logic/bloomable/server";
import { BloomableApi } from "../../../source/logic/bloomable/api";
import { BloomableAuth } from "../../../source/logic/bloomable/auth";
import { Orders } from "../../../source/logic/orders/orders";
import { Order } from "../../../source/logic/orders/models";

describe("Test Mocks and Demo Data", () => {
  beforeEach(() => {
    Mocks.setupDemoData();
  });

  afterEach(() => {
    Mocks.tearDownDemoData();
  });

  it("mocks getProfile (/api/me)", async () => {
    const profile = await BloomableApi.getProfile();
    expect(profile.data.name).toBe("Demo user");
    expect(profile.data.partner.name).toBe("Demo Florist");
  });

  it("mocks getRejectReasons (/api/order-line-reject-reasons)", async () => {
    const reasons = await BloomableApi.getRejectReasons();
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons).toContain("Out of stock on the flowers");
  });

  it("mocks getOrders with specific filter statuses", async () => {
    const openOrders = await BloomableApi.getOrders(1, "open");
    expect(openOrders.data.length).toBeGreaterThan(0);
    expect(openOrders.data.every(o => o.status === "open")).toBe(true);

    const fulfilledOrders = await BloomableApi.getOrders(1, "fulfilled");
    expect(fulfilledOrders.data.length).toBeGreaterThan(0);
    expect(fulfilledOrders.data.every(o => o.status === "fulfilled")).toBe(true);
  });

  it("mocks getOrders with all status", async () => {
    const allOrders = await BloomableApi.getOrders(1, "all");
    expect(allOrders.data.length).toBeGreaterThan(0);
  });

  it("mocks getOrder by ID and converts correctly", async () => {
    const allOrders = await BloomableApi.getOrders(1, "all");
    const sampleOrder = allOrders.data[0];

    const fetchedOrder = await BloomableApi.getOrder({ id: `${sampleOrder.id}` });
    expect(fetchedOrder.id).toBe(`${sampleOrder.id}`);
    expect(fetchedOrder.number).toBe(+sampleOrder.name.replace(/\D*/gi, ""));
  });

  it("mocks doesOrderExists", async () => {
    const allOrders = await BloomableApi.getOrders(1, "all");
    const existingId = allOrders.data[0].id;

    const exists = await BloomableApi.doesOrderExists({ id: `${existingId}` });
    expect(exists).toBe(true);

    const nonExistent = await BloomableApi.doesOrderExists({ id: "non-existent-id" });
    expect(nonExistent).toBe(false);
  });

  it("mocks getProduct variant", async () => {
    const product = await BloomableApi.getProduct({ id: 222 });
    expect(product.id).toBe(222);
    expect(product.name).toBe("Country Basket");
  });

  it("successfully lists all orders via Orders.list() without throwing errors", async () => {
    const orders = await Orders.list();
    expect(orders.length).toBeGreaterThan(0);
    // Should include multiple statuses
    const statuses = new Set(orders.map(o => o.status));
    expect(statuses.has("open")).toBe(true);
  });

  it("updates order status upon action (accept, fulfill, deliver, reject)", async () => {
    const orders = await Orders.list();
    const openOrder = orders.find(o => o.status === "open")!;
    expect(openOrder).toBeDefined();

    // Accept order
    await Orders.accept(openOrder);
    const acceptedOrder = await BloomableApi.getOrder({ id: openOrder.id! });
    expect(acceptedOrder.status).toBe("accepted");

    // Fulfill order
    await Orders.fulfill(openOrder);
    const fulfilledOrder = await BloomableApi.getOrder({ id: openOrder.id! });
    expect(fulfilledOrder.status).toBe("fulfilled");

    // Deliver order
    await Orders.deliver(openOrder);
    const deliveredOrder = await BloomableApi.getOrder({ id: openOrder.id! });
    expect(deliveredOrder.status).toBe("delivered");

    // Reject an order
    const anotherOpen = (await Orders.list()).find(o => o.status === "open");
    if (anotherOpen) {
      await Orders.reject(anotherOpen, "Too busy");
      const rejectedOrder = await BloomableApi.getOrder({ id: anotherOpen.id! });
      expect(rejectedOrder.status).toBe("cancelled");
    }
  });

  it("removes mocks when tearDownDemoData is called", () => {
    const mockedFetch = fetch;
    Mocks.tearDownDemoData();
    expect(fetch).not.toBe(mockedFetch);
  });

  it("removes mocks on Server.logout()", async () => {
    const tearDownSpy = jest.spyOn(Mocks, "tearDownDemoData");
    jest.spyOn(BloomableAuth, "logout").mockResolvedValueOnce(undefined as any);
    await Server.logout();
    expect(tearDownSpy).toHaveBeenCalled();
    tearDownSpy.mockRestore();
  });

  it("removes mocks when logging into a real account", async () => {
    const tearDownSpy = jest.spyOn(Mocks, "tearDownDemoData");
    jest.spyOn(BloomableAuth, "login").mockResolvedValueOnce(undefined as any);
    jest.spyOn(BloomableAuth, "logout").mockResolvedValueOnce(undefined as any);
    await Server.login({ username: "real_user", password: "real_password" });
    expect(tearDownSpy).toHaveBeenCalled();
    tearDownSpy.mockRestore();
  });
});
