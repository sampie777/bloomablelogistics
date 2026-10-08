import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { isEmulatorSync } from "react-native-device-info";
import { Permissions } from "./permissions";
import { rollbar, sanitizeErrorForRollbar } from "./rollbar";
import { settings } from "./settings/settings";
import { emptyPromise } from "./utils/utils";

export namespace Notifications {
  let isInitialized = false;
  let isSubscribed = false;
  const defaultTopic = "all";

  export const init = () => {
    if (isInitialized) return;
    isInitialized = true;

    Permissions.askNotificationPermission()
      .then(granted => {
        if (settings.notificationsShowForNewOrders) {
          if (granted) {
            subscribe();
          }
        } else {
          unsubscribe();
        }
      });
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

  const canUseIosApns = async (): Promise<boolean> => {
    if (Platform.OS !== "ios") return true;

    if (isEmulatorSync()) {
      console.info("Running on iOS Simulator; APNS remote notifications are not available.");
      return false;
    }

    try {
      if (!messaging().isDeviceRegisteredForRemoteMessages) {
        await messaging().registerDeviceForRemoteMessages();
      }

      let apnsToken = await messaging().getAPNSToken();
      let attempts = 0;
      while (!apnsToken && attempts < 5) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        apnsToken = await messaging().getAPNSToken();
        attempts++;
      }

      if (!apnsToken) {
        console.warn("APNS token not available on iOS. Skipping topic subscription.");
        return false;
      }

      return true;
    } catch (error) {
      console.warn("Failed to prepare iOS APNS token:", error);
      return false;
    }
  };

  export const subscribe = async () => {
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

    if (Platform.OS === "ios") {
      const apnsReady = await canUseIosApns();
      if (!apnsReady) {
        return;
      }
    }

    try {
      await messaging().subscribeToTopic(topic);
      isSubscribed = true;
    } catch (error: any) {
      if (error?.message?.includes("No APNS token specified")) {
        console.warn("FCM subscription skipped: No APNS token available.");
        return;
      }
      rollbar.error("Failed to subscribe to topic", {
        ...sanitizeErrorForRollbar(error),
        topic: topic,
      });
    }
  };

  export const unsubscribe = async (): Promise<any> => {
    const topic = getUserTopic();
    if (topic.length === 0) {
      rollbar.info("Can't unsubscribe from empty topic");
      return emptyPromise();
    }

    if (Platform.OS === "ios") {
      const apnsReady = await canUseIosApns();
      if (!apnsReady) {
        isSubscribed = false;
        return emptyPromise();
      }
    }

    try {
      await messaging().unsubscribeFromTopic(topic);
      isSubscribed = false;
    } catch (error: any) {
      if (error?.message?.includes("No APNS token specified")) {
        isSubscribed = false;
        return emptyPromise();
      }
      rollbar.error("Failed to unsubscribe from topic", {
        ...sanitizeErrorForRollbar(error),
        topic: topic,
      });
      return emptyPromise();
    }
  };
}
