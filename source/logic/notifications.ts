import messaging from "@react-native-firebase/messaging";
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

  // See https://firebase.google.com/docs/cloud-messaging/send-message#send-messages-to-topics-legacy
  export const convertUsernameToTopicName = (value: string): string => {
    return value
      .replace(/[\s\n\r]*/g, "")
      .replace(/[^a-zA-Z0-9-_.~%]+/g, "-")
      .toLowerCase();
  };

  const getUserTopic = () => {
    const { Server } = require("./bloomable/server");
    return convertUsernameToTopicName(Server.getCredentials().username ?? defaultTopic);
  };

  export const subscribe = () => {
    const { Server } = require("./bloomable/server");
    if (isSubscribed) return;
    if (!Server.isLoggedIn()) return;

    const topic = getUserTopic();
    if (topic.length === 0) {
      return rollbar.error("Invalid topic name", {
        topic: topic,
        username: Server.getCredentials().username,
      });
    }
    messaging().subscribeToTopic(topic)
      .then(() => isSubscribed = true)
      .catch(e => rollbar.error("Failed to subscribe to topic", {
        error: e,
        topic: topic,
      }));
  };

  export const unsubscribe = () => {
    const topic = getUserTopic();
    if (topic.length === 0) return;

    messaging().unsubscribeFromTopic(topic)
      .then(() => isSubscribed = false)
      .catch(e => rollbar.error("Failed to unsubscribe from topic", {
        error: e,
        topic: topic,
      }));
  };
}
