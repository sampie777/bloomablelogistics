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
      };
    },
  };
});

jest.mock("./source/logic/rollbar", () => {
  return {
    rollbar: {
      log: () => undefined,
      debug: () => undefined,
      info: () => undefined,
      warning: () => undefined,
      error: () => undefined,
      critical: () => undefined,
    },
    sanitizeErrorForRollbar: (error) => ({
      message: error?.message || error?.toString(),
    }),
  };
});

jest.mock("react-native-device-info", () => {
  return {
    getVersion: () => 1,
    getBuildNumber: () => 1,
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
