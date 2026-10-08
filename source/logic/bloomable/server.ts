import { rollbar, sanitizeErrorForRollbar, setDemoStatusProvider } from "../rollbar";
import EncryptedStorage from "react-native-encrypted-storage";
import { getUniqueId } from "react-native-device-info";
import { Notifications } from "../notifications";
import { BloomableAuth } from "./auth";
import LoginError = BloomableAuth.LoginError;
import { Validation } from "../utils/validation";
import { Mocks } from "../demoData/mocks";

export namespace Server {
  const emptyCredentials = { username: "", password: "" };
  let _credentials: BloomableAuth.Credentials = emptyCredentials;
  let credentialsRecalled: boolean = false;

  const setCredentials = (value: BloomableAuth.Credentials) => {
    _credentials = value;
  };

  export const getCredentials = () => _credentials;
  export const isDemoUser = () => _credentials?.username === "demo";

  export const login = (credentials: BloomableAuth.Credentials, maxRetries: number = 1): Promise<any> => {
    return logout()
      .then(() => {
        verifyUsername(credentials.username);
        verifyPassword(credentials.password);

        if (credentials.username === "demo") {
          Mocks.setupDemoData();
          rollbar.setPerson("demo", "demo", "demo@bloomable.com");
        } else {
          Mocks.tearDownDemoData();
          getUniqueId().then(deviceId => rollbar.setPerson(deviceId, credentials.username)).catch(() => {});
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
    setCredentials(emptyCredentials);
    getUniqueId().then(deviceId => rollbar.setPerson(deviceId)).catch(() => {});

    const promises: Promise<any>[] = [
      clearCredentials(),
      BloomableAuth.logout().finally(Mocks.tearDownDemoData),
    ];
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
        throw error;
      })
      .then(username => EncryptedStorage.getItem("password")
        .catch(error => {
          rollbar.critical("Error getting EncryptedStorage item", {
            ...sanitizeErrorForRollbar(error),
            key: "password",
          });
          throw error;
        })
        .then(password => {
          credentialsRecalled = true;

          if (username == null) throw Error("Username not found in EncryptedStorage");
          if (password == null) throw Error("Password not found in EncryptedStorage");

          const credentials = {
            username: username,
            password: password,
          };
          setCredentials(credentials);
          if (credentials.username === "demo") {
            Mocks.setupDemoData();
            rollbar.setPerson("demo", "demo", "demo@bloomable.com");
          } else {
            Mocks.tearDownDemoData();
            getUniqueId().then(deviceId => rollbar.setPerson(deviceId, credentials.username)).catch(() => {});
          }
          return credentials;
        }),
      );
  };

  const clearCredentials = async () => {
    setCredentials(emptyCredentials);
    await Promise.all([
      storageUpdateOrRemove("username", undefined),
      storageUpdateOrRemove("password", undefined),
    ]);
  };

  const storeCredentials = (credentials: BloomableAuth.Credentials) => {
    setCredentials(credentials);
    storageUpdateOrRemove("username", credentials.username);
    storageUpdateOrRemove("password", credentials.password);
  };

  const storageUpdateOrRemove = (key: string, value: string | undefined): Promise<void> => {
    if (value !== undefined) {
      return EncryptedStorage.setItem(key, value)
        .catch(error => {
          rollbar.critical("Error setting EncryptedStorage item", {
            ...sanitizeErrorForRollbar(error),
            key: key,
          });
        });
    } else {
      return EncryptedStorage.removeItem(key)
        .catch(error => {
          rollbar.error("Error clearing EncryptedStorage item", {
            ...sanitizeErrorForRollbar(error),
            key: key,
          });
        });
    }
  };

  export const acceptOrder = (id: string) => {
    return BloomableAuth.authenticatedFetch(_credentials, `https://dashboard.bloomable.com/api/orders/${id}/accept`, {
      method: "POST",
    });
  };

  export const fulfillOrder = (id: string) => {
    return BloomableAuth.authenticatedFetch(_credentials, `https://dashboard.bloomable.com/api/orders/${id}/fulfill`, {
      method: "POST",
    });
  };

  export const deliverOrder = (id: string) => {
    return BloomableAuth.authenticatedFetch(_credentials, `https://dashboard.bloomable.com/api/orders/${id}/deliver`, {
      method: "POST",
    });
  };

  export const rejectOrder = (id: string, reason: string) => {
    return BloomableAuth.authenticatedFetch(_credentials, `https://dashboard.bloomable.com/api/orders/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({
        reason: reason,
      }),
    });
  };
}

// Register dynamic demo status provider for Rollbar error tracking
setDemoStatusProvider(() => Server.isDemoUser());
