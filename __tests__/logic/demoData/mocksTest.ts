import { Mocks } from "../../../source/logic/demoData/mocks";
import { BloomableApi } from "../../../source/logic/bloomable/api";
import { Orders } from "../../../source/logic/orders/orders";
import { Server } from "../../../source/logic/bloomable/server";
import { BloomableAuth } from "../../../source/logic/bloomable/auth";

describe("Test Mocks and Demo Data", () => {
  beforeEach(() => {
    Mocks.setupDemoData();
  });

  afterEach(() => {
    Mocks.tearDownDemoData();
  });

  it("mocks getProfile (/api/me)", async () => {
    const profile = await BloomableApi.getProfile({ username: "demo", password: "demo" });
    expect(profile).toBeDefined();
    expect(profile.data.email).toBe("demo@gmail.com");
    expect(profile.data.name).toBe("Demo user");
  });

  it("mocks getRejectReasons (/api/order-line-reject-reasons)", async () => {
    const reasons = await BloomableApi.getRejectReasons({ username: "demo", password: "demo" });
    expect(reasons).toBeDefined();
    expect(Array.isArray(reasons)).toBe(true);
    expect(reasons.length).toBeGreaterThan(0);
    expect(reasons).toContain("Out of stock on the flowers");
  });

  it("mocks getOrders with specific filter statuses", async () => {
    const openOrders = await BloomableApi.getOrders(1, "open", { username: "demo", password: "demo" });
    expect(openOrders.data.length).toBeGreaterThan(0);
    expect(openOrders.data.every(it => it.status === "open")).toBe(true);
    expect(openOrders.meta.current_page).toBe(1);
    expect(openOrders.meta.last_page).toBe(1);

    const acceptedOrders = await BloomableApi.getOrders(1, "accepted", { username: "demo", password: "demo" });
    expect(acceptedOrders.data.length).toBeGreaterThan(0);
    expect(acceptedOrders.data.every(it => it.status === "accepted")).toBe(true);

    const fulfilledOrders = await BloomableApi.getOrders(1, "fulfilled", { username: "demo", password: "demo" });
    expect(fulfilledOrders.data.length).toBe(1);
    expect(fulfilledOrders.data[0].status).toBe("fulfilled");

    const deliveredOrders = await BloomableApi.getOrders(1, "delivered", { username: "demo", password: "demo" });
    expect(deliveredOrders.data.length).toBeGreaterThan(0);
    expect(deliveredOrders.data.every(it => it.status === "delivered")).toBe(true);

    const cancelConfirmedOrders = await BloomableApi.getOrders(1, "cancel-confirmed", { username: "demo", password: "demo" });
    expect(cancelConfirmedOrders.data.length).toBe(1);
    expect(cancelConfirmedOrders.data[0].status).toBe("cancel-confirmed");
  });

  it("mocks getOrders with all status", async () => {
    const allOrders = await BloomableApi.getOrders(1, "all", { username: "demo", password: "demo" });
    expect(allOrders.data.length).toBe(15);
  });

  it("mocks getOrder by ID and converts correctly", async () => {
    const order = await BloomableApi.getOrder({ id: "4474" }, { username: "demo", password: "demo" });
    expect(order).toBeDefined();
    expect(order.id).toBe("4474");
    expect(order.status).toBe("open");
    expect(order.recipient.name).toBe("Arthur V. West");
    expect(order.products.length).toBe(1);
  });

  it("mocks doesOrderExists", async () => {
    const exists = await BloomableApi.doesOrderExists({ id: "4474" }, { username: "demo", password: "demo" });
    expect(exists).toBe(true);

    const doesNotExist = await BloomableApi.doesOrderExists({ id: "999999" }, { username: "demo", password: "demo" });
    expect(doesNotExist).toBe(false);
  });

  it("mocks getProduct variant", async () => {
    const product = await BloomableApi.getProduct({ id: 222 }, { username: "demo", password: "demo" });
    expect(product).toBeDefined();
    expect(product.id).toBe(222);
    expect(product.name).toBe("Country Basket");
    expect(product.size).toBe("Medium (As Shown)");
  });

  it("successfully lists all orders via Orders.list() without throwing errors", async () => {
    const orders = await Orders.list();
    expect(orders).toBeDefined();
    expect(orders.length).toBeGreaterThan(0);

    const statuses = new Set(orders.map(it => it.status));
    expect(statuses.has("open")).toBe(true);
    expect(statuses.has("accepted")).toBe(true);
    expect(statuses.has("fulfilled")).toBe(true);
    expect(statuses.has("delivered")).toBe(true);
  });

  it("updates order status upon action (accept, fulfill, deliver, reject)", async () => {
    // Order 4474 starts as "open"
    let order = await BloomableApi.getOrder({ id: "4474" }, { username: "demo", password: "demo" });
    expect(order.status).toBe("open");

    // Accept order
    await BloomableApi.acceptOrder({ id: "4474" }, { username: "demo", password: "demo" });
    order = await BloomableApi.getOrder({ id: "4474" }, { username: "demo", password: "demo" });
    expect(order.status).toBe("accepted");

    // Fulfill order
    await BloomableApi.fulfillOrder({ id: "4474" }, { username: "demo", password: "demo" });
    order = await BloomableApi.getOrder({ id: "4474" }, { username: "demo", password: "demo" });
    expect(order.status).toBe("fulfilled");

    // Deliver order
    await BloomableApi.deliverOrder({ id: "4474" }, { username: "demo", password: "demo" });
    order = await BloomableApi.getOrder({ id: "4474" }, { username: "demo", password: "demo" });
    expect(order.status).toBe("delivered");

    // Reject order 4444 (open -> cancelled)
    await BloomableApi.rejectOrder({ id: "4444" }, "No driver", { username: "demo", password: "demo" });
    const rejectedOrder = await BloomableApi.getOrder({ id: "4444" }, { username: "demo", password: "demo" });
    expect(rejectedOrder.status).toBe("cancelled");
  });

  it("removes mocks when tearDownDemoData is called", () => {
    const fetchWithMocks = fetch;
    Mocks.tearDownDemoData();
    expect(fetch).not.toBe(fetchWithMocks);
  });

  it("removes mocks on Server.logout()", async () => {
    const tearDownSpy = jest.spyOn(Mocks, "tearDownDemoData");
    jest.spyOn(BloomableAuth, "logout").mockResolvedValueOnce(undefined);

    await Server.logout();
    expect(tearDownSpy).toHaveBeenCalled();

    tearDownSpy.mockRestore();
  });

  it("removes mocks when logging into a real account", async () => {
    const tearDownSpy = jest.spyOn(Mocks, "tearDownDemoData");
    jest.spyOn(BloomableAuth, "logout").mockResolvedValueOnce(undefined);
    jest.spyOn(BloomableAuth, "login").mockResolvedValueOnce(undefined);

    await Server.login({ username: "realuser@example.com", password: "realpassword" });
    expect(tearDownSpy).toHaveBeenCalled();

    tearDownSpy.mockRestore();
  });
});
