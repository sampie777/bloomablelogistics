import { settings } from "../../../source/logic/settings/settings";
import { SettingsUtils } from "../../../source/logic/settings/settingsUtils";
import { rollbar } from "../../../source/logic/rollbar";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("Settings & SettingsUtils", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it("has default values defined for all expected settings keys", () => {
    expect(typeof settings.notificationsShowForNewOrders).toBe("boolean");
    expect(typeof settings.disableOrderActions).toBe("boolean");
    expect(typeof settings.useInitialCoordinatesForOrders).toBe("boolean");
    expect(typeof settings.maxPastOrderPagesToFetch).toBe("number");
  });

  it("stores and loads all settings without triggering Rollbar errors", async () => {
    const rollbarErrorSpy = jest.spyOn(rollbar, "error");

    settings.load();
    // Allow promises in load() to resolve
    await new Promise(resolve => setTimeout(resolve, 50));

    settings.disableOrderActions = true;
    settings.store();

    // Check that Rollbar error was never called for unsupported type or store failure
    expect(rollbarErrorSpy).not.toHaveBeenCalled();

    // Verify AsyncStorage stored the boolean as string
    const storedValue = await AsyncStorage.getItem("disableOrderActions");
    expect(storedValue).toBe("true");

    // Reset settings in-memory and reload from AsyncStorage
    settings.disableOrderActions = false;
    settings.load();
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(settings.disableOrderActions).toBe(true);
    expect(rollbarErrorSpy).not.toHaveBeenCalled();
  });

  it("safely handles undefined values during store without calling Rollbar", () => {
    const rollbarErrorSpy = jest.spyOn(rollbar, "error");
    const testObj: any = {
      testUndefinedKey: undefined,
    };

    SettingsUtils.store(testObj);
    expect(rollbarErrorSpy).not.toHaveBeenCalled();
  });
});
