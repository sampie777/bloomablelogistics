import { rollbar } from "../rollbar";
import EncryptedStorage from "react-native-encrypted-storage";
import { emptyPromise } from "../utils";
import { Notifications } from "../notifications";
import { throwErrorsIfNotOk } from "../apiUtils";
import { BloomableAuth } from "./auth";
import LoginError = BloomableAuth.LoginError;
import { Validation } from "../utils/validation";
import { BloomableApi } from "./api";

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
    logout();

    verifyUsername(credentials.username);
    verifyPassword(credentials.password);

    if (credentials.username === "demo" && credentials.password === "demo") {
      rollbar.info("Demo account logged in");
      storeCredentials(credentials);
      return emptyPromise();
    }

    return BloomableAuth.login(credentials)
      .then(() => storeCredentials(credentials))
      .catch(error => {
        if (!(error instanceof LoginError)) {
          rollbar.error("Error logging in on server", {
            error: error,
            maxRetries: maxRetries,
          });
        }
        throw error;
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

  export const logout = () => {
    Notifications.unsubscribe();
    clearCredentials();
    BloomableAuth.logout();
  };

  export const isLoggedIn = () => {
    return _credentials.username.length > 0;
  };

  export const isCredentialsRecalled = () => credentialsRecalled;

  export const recallCredentials = (): Promise<BloomableAuth.Credentials> => {
    return EncryptedStorage.getItem("username")
      .catch(error => {
        rollbar.critical("Error getting EncryptedStorage item", {
          error: error,
          key: "username",
        });
        throw error;
      })
      .then(username => EncryptedStorage.getItem("password")
        .catch(error => {
          rollbar.critical("Error getting EncryptedStorage item", {
            error: error,
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
            error: error,
            key: key,
          });
        });
    } else {
      EncryptedStorage.removeItem(key)
        .catch(error => {
          rollbar.error("Error clearing EncryptedStorage item", {
            error: error,
            key: key,
          });
        });
    }
  };

  export const acceptOrder = (id: string) => {
    return BloomableApi.acceptOrder({ id: id })
      .catch(error => {
        rollbar.error("Error accepting order", {
          error: error,
          id: id,
        });
        throw error;
      });
  };

  export const rejectOrder = (id: string) => {
    return BloomableApi.rejectOrder({ id: id })
      .catch(error => {
        rollbar.error("Error rejecting order", {
          error: error,
          id: id,
        });
        throw error;
      });
  };

  export const deliverOrder = (id: string) => {
    return BloomableApi.deliverOrder({ id: id })
      .catch(error => {
        rollbar.error("Error delivering order", {
          error: error,
          id: id,
        });
        throw error;
      });
  };
}
