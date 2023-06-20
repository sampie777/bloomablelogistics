import { SettingsUtils } from "./settingsUtils";

export const settings = {
  load: () => console.debug("Method not implemented"),
  store: () => console.debug("Method not implemented"),

  notificationsShowForNewOrders: true,
};

settings.load = () => SettingsUtils.load(settings);
settings.store = () => SettingsUtils.store(settings);
