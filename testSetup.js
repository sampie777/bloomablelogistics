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
