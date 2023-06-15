import { Permission, PermissionsAndroid } from "react-native";
import { rollbar } from "./rollbar";
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
        .catch(e => {
          rollbar.error("Failed to check for permission", {
            error: e,
            permission: permission,
          });
          return emptyPromiseWithValue(false);
        });
    } catch (e: any) {
      rollbar.error("Failed to ask for permission", {
        error: e,
        permission: permission,
      });
      return emptyPromiseWithValue(false);
    }
  };

  const promptPermission = (permission: Permission): Promise<boolean> => {
    return PermissionsAndroid.request(permission)
      .then(status => status === "granted")
      .catch(e => {
        rollbar.error("Failed to prompt for permission", {
          error: e,
          permission: permission,
        });
        return emptyPromiseWithValue(false);
      });
  };
}
