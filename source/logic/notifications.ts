import messaging from "@react-native-firebase/messaging";
import Server from "./bloomable/server";
import { Permissions } from "./permissions";
import { PermissionsAndroid } from "react-native";
import { rollbar } from "./rollbar";
import { settings } from "./settings/settings";

export namespace Notifications {
  let isInitialized = false;
  let isSubscribed = false;
  const defaultTopic = "all";

  export const init = () => {
    if (isInitialized) return;
    isInitialized = true;

    Permissions.askPermission(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    if (settings.notificationsShowForNewOrders) {
      subscribe();
    } else {
      unsubscribe();
    }
  };

  export const subscribe = () => {
    if (isSubscribed) return;
    if (!Server.isLoggedIn()) return;

    const topic = Server.getUsername() ?? defaultTopic;
    messaging().subscribeToTopic(topic)
      .then(() => isSubscribed = true)
      .catch(e => rollbar.error("Failed to subscribe to topic", {
        error: e,
        topic: topic,
      }));
  };

  export const unsubscribe = () => {
    const topic = Server.getUsername() ?? defaultTopic;
    messaging().unsubscribeFromTopic(topic)
      .then(() => isSubscribed = false)
      .catch(e => rollbar.error("Failed to unsubscribe from topic", {
        error: e,
        topic: topic,
      }));
  };
}
