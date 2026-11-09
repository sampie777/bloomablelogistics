import { rollbar, sanitizeErrorForRollbar, setDemoStatusProvider } from "../rollbar";
import EncryptedStorage from "react-native-encrypted-storage";
import { getUniqueId } from "react-native-device-info";
import { Notifications } from "../notifications";
import { BloomableAuth } from "./auth";
import { Validation } from "../utils/validation";
import { Mocks } from "../demoData/mocks";
import { clearSession } from "./session";
import { ProductCache } from "./productCache";
import LoginError = BloomableAuth.LoginError;

export namespace Server {
  const emptyCredentials = { username: "", password: "" };
  let _credentials: BloomableAuth.Credentials = emptyCredentials;
  let credentialsRecalled: boolean = false;

  const setCredentials = (value: BloomableAuth.Credentials) => {
    _credentials = value;
  };

  export const getCredentials = () => _credentials;
  export const isDemoUser = () => _credentials?.username === "demo";

  export const login = (
    credentials: BloomableAuth.Credentials,
    maxRetries: number = 1,
  ): Promise<any> => {
    return logout().then(() => {
      verifyUsername(credentials.username);
      verifyPassword(credentials.password);

      if (credentials.username === "demo") {
        Mocks.setupDemoData();
        rollbar.setPerson("demo", "demo", "demo@bloomable.com");
      } else {
        Mocks.tearDownDemoData();
        getUniqueId()
          .then(deviceId => rollbar.setPerson(deviceId, credentials.username))
          .catch(() => {});
      }

      return BloomableAuth.login(credentials)
        .then(() => storeCredentials(credentials))
        .catch(error => {
          if (!(error instanceof LoginError)) {
            rollbar.error("Error logging in on server", {
              ...sanitizeErrorForRollbar(error),
              maxRetries: maxRetries,
            });
          }
          throw error;
        });
    });
  };

  const verifyUsername = (value: string) => {
    Validation.validate(value != null, "Username cannot be null");
    Validation.validate(value.length > 0, "Username cannot be empty");
  };

  const verifyPassword = (value: string) => {
    Validation.validate(value != null, "Password cannot be null");
    Validation.validate(value.length > 0, "Password cannot be empty");
  };

  export const logout = async (): Promise<unknown> => {
    const currentUser = _credentials.username;
    const isDemo = currentUser === "demo";

    setCredentials(emptyCredentials);
    ProductCache.clear();
    getUniqueId()
      .then(deviceId => rollbar.setPerson(deviceId))
      .catch(() => {});

    const promises: Promise<any>[] = [clearCredentials()];

    if (isDemo || !currentUser) {
      clearSession();
      Mocks.tearDownDemoData();
    } else {
      promises.push(
        BloomableAuth.logout().finally(() => {
          clearSession();
          Mocks.tearDownDemoData();
        }),
      );
    }

    if (currentUser) {
      promises.push(Notifications.unsubscribe(currentUser).catch(() => {}));
    }
    return Promise.all(promises);
  };

  export const isLoggedIn = () => {
    return _credentials.username.length > 0;
  };

  export const isCredentialsRecalled = () => credentialsRecalled;

  export const recallCredentials = (): Promise<BloomableAuth.Credentials> => {
    return EncryptedStorage.getItem("username")
      .catch(error => {
        rollbar.critical("Error getting EncryptedStorage item", {
          ...sanitizeErrorForRollbar(error),
          key: "username",
        });
        return null;
      })
      .then(username => {
        return EncryptedStorage.getItem("password")
          .catch(error => {
            rollbar.critical("Error getting EncryptedStorage item", {
              ...sanitizeErrorForRollbar(error),
              key: "password",
            });
            return null;
          })
          .then(password => {
            return {
              username: username ?? "",
              password: password ?? "",
            };
          });
      })
      .then(credentials => {
        credentialsRecalled = true;
        setCredentials(credentials);
        return credentials;
      });
  };

  export const storeCredentials = (credentials: BloomableAuth.Credentials) => {
    setCredentials(credentials);
    return EncryptedStorage.setItem("username", credentials.username)
      .catch(error => {
        rollbar.critical("Error setting EncryptedStorage item", {
          ...sanitizeErrorForRollbar(error),
          key: "username",
        });
      })
      .then(() => EncryptedStorage.setItem("password", credentials.password))
      .catch(error => {
        rollbar.critical("Error setting EncryptedStorage item", {
          ...sanitizeErrorForRollbar(error),
          key: "password",
        });
      });
  };

  const removeStorageItemSafely = (key: string): Promise<void> => {
    return EncryptedStorage.removeItem(key).catch((error: any) => {
      // -25300 is errSecItemNotFound on iOS keychain: the item did not exist in storage to remove
      const errorCode = error?.code || error?.userInfo?.code;
      if (errorCode === "-25300" || errorCode === -25300) {
        return;
      }
      rollbar.critical("Error removing EncryptedStorage item", {
        ...sanitizeErrorForRollbar(error),
        key: key,
      });
    });
  };

  export const clearCredentials = () => {
    setCredentials(emptyCredentials);
    return removeStorageItemSafely("username").then(() =>
      removeStorageItemSafely("password"),
    );
  };

  const orderActionHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Bloomable-Client": "Web",
    Referer: "https://dashboard.bloomable.com/dashboard",
  };

  const callOrderAction = (
    id: string,
    action: "accept" | "fulfill" | "deliver",
    body?: any,
  ): Promise<Response> => {
    return BloomableAuth.authenticatedFetch(
      _credentials,
      `https://dashboard.bloomable.com/api/orders/${id}/${action}`,
      {
        method: "POST",
        headers: orderActionHeaders,
        body: body ? JSON.stringify(body) : undefined,
      },
    )
      .then(response => {
        if (response.status !== 200) {
          throw new Error(
            `Failed to ${action} order (status=${response.status})`,
          );
        }
        return response;
      })
      .catch(error => {
        rollbar.error(`Error ${action}ing order`, {
          ...sanitizeErrorForRollbar(error),
          id: id,
        });
        throw error;
      });
  };

  export const acceptOrder = (id: string) => {
    return callOrderAction(id, "accept");
  };

  export const fulfillOrder = (id: string) => {
    return callOrderAction(id, "fulfill");
  };

  export const deliverOrder = (id: string) => {
    return callOrderAction(id, "deliver");
  };

  export const rejectOrder = (id: string, reason: string) => {
    return BloomableAuth.authenticatedFetch(
      _credentials,
      `https://dashboard.bloomable.com/api/orders/${id}/reject`,
      {
        method: "POST",
        headers: orderActionHeaders,
        body: JSON.stringify({
          reason: reason,
        }),
      },
    )
      .then(response => {
        if (response.status !== 200) {
          throw new Error(`Failed to reject order (status=${response.status})`);
        }
        return response;
      })
      .catch(error => {
        rollbar.error("Error rejecting order", {
          ...sanitizeErrorForRollbar(error),
          id: id,
          reason: reason,
        });
        throw error;
      });
  };
}

// Register dynamic demo status provider for Rollbar error tracking
setDemoStatusProvider(() => Server.isDemoUser());
