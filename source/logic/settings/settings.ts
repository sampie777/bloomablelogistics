import { SettingsUtils } from "./settingsUtils";

export const settings: { [key: string]: any} = {
  load: () => console.debug("Method not implemented"),
  store: () => console.debug("Method not implemented"),

  notificationsShowForNewOrders: true,
  disableOrderActions: false,
  useInitialCoordinatesForOrders: true,
  maxOrderPagesToFetch: 3,
};

settings.load = () => SettingsUtils.load(settings);
settings.store = () => SettingsUtils.store(settings);
