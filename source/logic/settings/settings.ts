import { SettingsUtils } from "./settingsUtils";

export const settings: { [key: string]: any} = {
  load: () => console.debug("Method not implemented"),
  store: () => console.debug("Method not implemented"),

  notificationsShowForNewOrders: true,
  disableOrderActions: false,
  useInitialCoordinatesForOrders: true,
  maxPastOrderPagesToFetch: 1,
};

settings.load = () => SettingsUtils.load(settings);
settings.store = () => SettingsUtils.store(settings);
