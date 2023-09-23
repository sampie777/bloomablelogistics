import { Permission, PermissionsAndroid } from "react-native";
import { rollbar, sanitizeErrorForRollbar } from "./rollbar";
import { emptyPromiseWithValue } from "./utils";

export namespace Permissions {
  export const askPermission = (permission: Permission): Promise<boolean> => {
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
}
