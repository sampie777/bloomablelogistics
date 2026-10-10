import { Permission, PermissionsAndroid, Platform } from "react-native";
import { rollbar, sanitizeErrorForRollbar } from "./rollbar";
import { emptyPromiseWithValue } from "./utils/utils";
import messaging from "@react-native-firebase/messaging";
import { isEmulatorSync } from "react-native-device-info";

export namespace Permissions {
  export const askPermission = (permission: Permission): Promise<boolean> => {
    if (Platform.OS !== "android") {
      return emptyPromiseWithValue(false);
    }

    try {
      return PermissionsAndroid.check(permission)
        .then(isGranted => {
          if (isGranted) {
            return emptyPromiseWithValue(true);
          }

          return promptPermission(permission);
        })
        .catch(error => {
          rollbar.error("Failed to check for permission", {
            ...sanitizeErrorForRollbar(error),
            permission: permission,
          });
          return emptyPromiseWithValue(false);
        });
    } catch (error: any) {
      rollbar.error("Failed to ask for permission", {
        ...sanitizeErrorForRollbar(error),
        permission: permission,
      });
      return emptyPromiseWithValue(false);
    }
  };

  const promptPermission = (permission: Permission): Promise<boolean> => {
    return PermissionsAndroid.request(permission)
      .then(status => status === "granted")
      .catch(error => {
        rollbar.error("Failed to prompt for permission", {
          ...sanitizeErrorForRollbar(error),
          permission: permission,
        });
        return emptyPromiseWithValue(false);
      });
  };

  export const askNotificationPermission = async (): Promise<boolean> => {
    if (Platform.OS === "android") {
      if (typeof Platform.Version === "number" && Platform.Version >= 33 && PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS) {
        return askPermission(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      }
      return true;
    }

    if (Platform.OS === "ios") {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled && !isEmulatorSync()) {
          try {
            if (!messaging().isDeviceRegisteredForRemoteMessages) {
              await messaging().registerDeviceForRemoteMessages();
            }
          } catch (error) {
            console.warn("Failed to register device for remote messages:", error);
          }
        }
        return enabled;
      } catch (error: any) {
        rollbar.error("Failed to ask for iOS notification permission", sanitizeErrorForRollbar(error));
        return false;
      }
    }

    return false;
  };
}
