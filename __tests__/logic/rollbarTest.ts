describe("Rollbar Error Logging & Demo Status", () => {
  let rollbarModule: typeof import("../../source/logic/rollbar");

  beforeEach(() => {
    jest.isolateModules(() => {
      // Unmock rollbar to test the real implementation in this suite
      jest.unmock("../../source/logic/rollbar");
      rollbarModule = require("../../source/logic/rollbar");
    });
  });

  afterEach(() => {
    rollbarModule.setDemoStatus(null);
  });

  it("defaults to normal (non-demo) status", () => {
    expect(rollbarModule.getIsDemo()).toBe(false);
    expect(rollbarModule.getDemoStatus()).toBe("normal");
    expect(rollbarModule.getDemoMetadata()).toEqual({
      is_demo: false,
      demo_status: "normal",
    });
  });

  it("reflects manual demo status when set", () => {
    rollbarModule.setDemoStatus(true);
    expect(rollbarModule.getIsDemo()).toBe(true);
    expect(rollbarModule.getDemoStatus()).toBe("demo");
    expect(rollbarModule.getDemoMetadata()).toEqual({
      is_demo: true,
      demo_status: "demo",
    });

    rollbarModule.setDemoStatus(false);
    expect(rollbarModule.getIsDemo()).toBe(false);
    expect(rollbarModule.getDemoStatus()).toBe("normal");
  });

  it("dynamically reads demo status from registered provider", () => {
    let mockIsDemo = false;
    rollbarModule.setDemoStatusProvider(() => mockIsDemo);

    expect(rollbarModule.getIsDemo()).toBe(false);
    expect(rollbarModule.getDemoStatus()).toBe("normal");

    mockIsDemo = true;
    expect(rollbarModule.getIsDemo()).toBe(true);
    expect(rollbarModule.getDemoStatus()).toBe("demo");
  });

  it("enriches extra with demo status metadata", () => {
    rollbarModule.setDemoStatus(true);
    const enriched = rollbarModule.enrichExtraWithDemoStatus({ orderId: "123" });
    expect(enriched).toEqual({
      is_demo: true,
      demo_status: "demo",
      orderId: "123",
    });
  });

  it("enriches undefined or null extra with demo status metadata", () => {
    rollbarModule.setDemoStatus(false);
    const enriched = rollbarModule.enrichExtraWithDemoStatus(undefined);
    expect(enriched).toEqual({
      is_demo: false,
      demo_status: "normal",
    });
  });

  it("logs with demo status included in extra parameters", () => {
    rollbarModule.setDemoStatus(true);
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    rollbarModule.rollbar.error("Test error", { code: 500 });

    expect(consoleErrorSpy).toHaveBeenCalledWith("Test error", {
      is_demo: true,
      demo_status: "demo",
      code: 500,
    });

    consoleErrorSpy.mockRestore();
  });

  it("sanitizes Error objects properly for Rollbar", () => {
    const error = new Error("Sample error");
    const sanitized = rollbarModule.sanitizeErrorForRollbar(error);

    expect(sanitized.error.original).toBe(error);
    expect(sanitized.error.name).toBe("Error");
    expect(sanitized.error.message).toBe("Sample error");
    expect(typeof sanitized.error.stack).toBe("string");
  });

  it("sanitizes non-Error objects properly for Rollbar", () => {
    const nonError = { customMessage: "Failed without Error object" };
    const sanitized = rollbarModule.sanitizeErrorForRollbar(nonError);

    expect(sanitized.error.original).toBe(nonError);
    expect(sanitized.error.json).toBe(JSON.stringify(nonError));
  });
});
