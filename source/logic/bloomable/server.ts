import { rollbar, sanitizeErrorForRollbar } from "../rollbar";
import EncryptedStorage from "react-native-encrypted-storage";
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

  export const logout = (): Promise<unknown> => {
    Notifications.unsubscribe();
    clearCredentials();
    return BloomableAuth.logout()
      .then(Mocks.tearDownDemoData);
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
          return credentials;
        }),
      );
  };

  const clearCredentials = () => {
    setCredentials(emptyCredentials);
    storageUpdateOrRemove("username", undefined);
    storageUpdateOrRemove("password", undefined);
  };

  const storeCredentials = (credentials: BloomableAuth.Credentials) => {
    setCredentials(credentials);
    storageUpdateOrRemove("username", credentials.username);
    storageUpdateOrRemove("password", credentials.password);
  };

  const storageUpdateOrRemove = (key: string, value: string | undefined) => {
    if (value !== undefined) {
      EncryptedStorage.setItem(key, value)
        .catch(error => {
          rollbar.critical("Error setting EncryptedStorage item", {
            ...sanitizeErrorForRollbar(error),
            key: key,
          });
        });
    } else {
      EncryptedStorage.removeItem(key)
        .catch(error => {
          rollbar.error("Error clearing EncryptedStorage item", {
            ...sanitizeErrorForRollbar(error),
            key: key,
          });
        });
    }
  };

  export const acceptOrder = (id: string) => {
    const { BloomableApi } = require("./api");
    return BloomableApi.acceptOrder({ id: id })
      .catch((error: any) => {
        rollbar.error("Error accepting order", {
          ...sanitizeErrorForRollbar(error),
          id: id,
        });
        throw error;
      });
  };

  export const rejectOrder = (id: string, reason: string) => {
    const { BloomableApi } = require("./api");
    return BloomableApi.rejectOrder({ id: id }, reason)
      .catch((error: any) => {
        rollbar.error("Error rejecting order", {
          ...sanitizeErrorForRollbar(error),
          id: id,
        });
        throw error;
      });
  };

  export const fulfillOrder = (id: string) => {
    const { BloomableApi } = require("./api");
    return BloomableApi.fulfillOrder({ id: id })
      .catch((error: any) => {
        rollbar.error("Error fulfilling order", {
          ...sanitizeErrorForRollbar(error),
          id: id,
        });
        throw error;
      });
  };

  export const deliverOrder = (id: string) => {
    const { BloomableApi } = require("./api");
    return BloomableApi.deliverOrder({ id: id })
      .catch((error: any) => {
        rollbar.error("Error delivering order", {
          ...sanitizeErrorForRollbar(error),
          id: id,
        });
        throw error;
      });
  };
}
