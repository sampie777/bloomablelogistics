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
  };
});

jest.mock("react-native-device-info", () => {
  return {
    getVersion: () => 1,
  };
});

jest.mock("react-native-encrypted-storage", () => {
  return {
    getItem: () => undefined,
    setItem: () => undefined,
  };
});

jest.mock("./source/logic/cache", () => {
  return {
    locationCache: () => undefined,
  };
});

jest.mock("@react-native-firebase/messaging", () => {
  return {
    messaging: () => ({
      subscribeToTopic: () => undefined,
      unsubscribeFromTopic: () => undefined,
      getToken: () => undefined,
      setBackgroundMessageHandler: () => undefined,
    })
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
