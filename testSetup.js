jest.mock("rollbar-react-native", () => {
  return {
    Configuration: () => undefined,
    Client: () => {
      return {
        log: () => undefined,
        debug: () => undefined,
        info: () => undefined,
        warning: () => undefined,
        error: () => undefined,
        critical: () => undefined,
        setPerson: () => undefined,
        clearPerson: () => undefined,
      };
    },
  };
});

jest.mock("./source/logic/rollbar", () => {
  let isDemo = false;
  let demoProvider = null;
  const getDemo = () => (demoProvider ? demoProvider() : isDemo);

  return {
    rollbar: {
      log: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
      error: jest.fn(),
      critical: jest.fn(),
      setPerson: jest.fn(),
      clearPerson: jest.fn(),
    },
    sanitizeErrorForRollbar: (error) => ({
      message: error?.message || error?.toString(),
    }),
    setDemoStatusProvider: jest.fn((provider) => {
      demoProvider = provider;
    }),
    setDemoStatus: jest.fn((status) => {
      isDemo = status;
    }),
    getIsDemo: jest.fn(() => getDemo()),
    getDemoStatus: jest.fn(() => (getDemo() ? "demo" : "normal")),
    getDemoMetadata: jest.fn(() => ({
      is_demo: getDemo(),
      demo_status: getDemo() ? "demo" : "normal",
    })),
    enrichExtraWithDemoStatus: jest.fn((extra) => ({
      is_demo: getDemo(),
      demo_status: getDemo() ? "demo" : "normal",
      ...(extra && typeof extra === "object" ? extra : { extra }),
    })),
  };
});

jest.mock("react-native-device-info", () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
    getUniqueId: jest.fn(() => Promise.resolve("mock-unique-id")),
    isEmulator: jest.fn(() => Promise.resolve(false)),
    isEmulatorSync: jest.fn(() => false),
  };
});

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-native-encrypted-storage", () => {
  return {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  };
});

jest.mock("./source/logic/cache", () => {
  return {
    locationCache: () => undefined,
  };
});

jest.mock("@react-native-firebase/messaging", () => {
  const mockMessagingInstance = {
    subscribeToTopic: jest.fn(() => Promise.resolve()),
    unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
    getToken: jest.fn(() => Promise.resolve("mock-token")),
    getAPNSToken: jest.fn(() => Promise.resolve("mock-apns-token")),
    setBackgroundMessageHandler: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    hasPermission: jest.fn(() => Promise.resolve(1)),
    registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
    isDeviceRegisteredForRemoteMessages: true,
  };

  const mockMessagingFn = jest.fn(() => mockMessagingInstance);
  mockMessagingFn.AuthorizationStatus = {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };

  return {
    __esModule: true,
    default: mockMessagingFn,
    messaging: mockMessagingFn,
  };
});
