import { SettingsUtils } from "./settingsUtils";

export const settings: {[key: string]: any} = {
  load: SettingsUtils.load,
  store: SettingsUtils.store,

  notificationsShowForNewOrders: true,
};
