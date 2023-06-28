import { rollbar } from "../rollbar";
import { api } from "../api";
import { ServerHtml } from "./html";
import EncryptedStorage from "react-native-encrypted-storage";
import { emptyPromise } from "../utils";
import { Notifications } from "../notifications";
import { throwErrorsIfNotOk } from "../apiUtils";

export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginError";
  }
}

class Server {
  private cookie: string | undefined = undefined;
  private username: string | undefined = undefined;
  private credentialsRecalled: boolean = false;

  setCookie(value: string) {
    this.cookie = value;
  }

  setUsername(value: string) {
    // Apparently Bloomable accepts extra whitespaces around its credentials and isn't case-sensitive. But we are!
    this.username = value.trim().toLowerCase();
  }

  getCookie = () => this.cookie;
  getUsername = () => this.username;
  isDemoUser = () => this.username === "demo";

  login(username: string, password: string, maxRetries: number = 1): Promise<any> {
    this.logout();

    if (username === "demo" && password === "demo") {
      rollbar.info("Demo account logged in");
      this.setCookie("demo");
      this.setUsername("demo");
      this.storeCredentials();
      return emptyPromise();
    }

    return api.auth.login(username, password)
      .then(throwErrorsIfNotOk)
      .then(response => {
        const cookies = response.headers.get("set-cookie");

        if (cookies) {
          this.processCookie(cookies);
        }

        this.setUsername(username);
        this.storeCredentials();

        return response.text();
      })
      .then(html => {
        if (this.isLoggedIn()) {
          return;
        }

        const message = ServerHtml.loginResponseToError(html);
        if (maxRetries > 0 && message.trim().length === 0) {
          rollbar.warning("Retrying login due to html response", {
            html: html,
            maxRetries: maxRetries,
          });
          return this.login(username, password, maxRetries - 1);
        }
        throw new LoginError(message);
      })
      .catch(error => {
        if (!(error instanceof LoginError)) {
          rollbar.error("Error logging in on server", {
            error: error,
            maxRetries: maxRetries,
          });
        }
        throw error;
      });
  }

  processCookie(cookies: string) {
    cookies.split(",")
      .forEach(cookie => cookie.split(";")
        .filter(it => it.trim().startsWith("SAFlorist="))
        .forEach(it => {
          const part = it.trim();
          this.cookie = part.substring("SAFlorist=".length, part.length);
        }),
      );
  }

  logout() {
    Notifications.unsubscribe();
    this.cookie = undefined;
    this.username = undefined;
    this.storeCredentials();
  }

  isLoggedIn() {
    return this.cookie !== undefined && this.username !== undefined;
  }

  isCredentialsRecalled = () => this.credentialsRecalled;

  recallCredentials() {
    return EncryptedStorage.getItem("cookie")
      .then(value => {
        if (value) {
          this.setCookie(value);
        }
      })
      .catch(error => {
        rollbar.critical("Error getting EncryptedStorage item", {
          error: error,
          key: "cookie",
        });
      }).then(() =>
        EncryptedStorage.getItem("username")
          .then(value => {
            this.credentialsRecalled = true;
            if (value) {
              this.setUsername(value);
            }
          })
          .catch(error => {
            rollbar.critical("Error getting EncryptedStorage item", {
              error: error,
              key: "username",
            });
          }),
      );
  }

  storeCredentials() {
    this.storageUpdateOrRemove("cookie", this.cookie);
    this.storageUpdateOrRemove("username", this.username);
  }

  private storageUpdateOrRemove(key: string, value: string | undefined) {
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
  }

  getOrdersPage(page: number) {
    return api.orders.list(page)
      .then(throwErrorsIfNotOk)
      .then(response => response.text())
      .catch(error => {
        rollbar.error("Error fetching orders data", {
          error: error,
          page: page,
        });
        throw error;
      });
  }

  getOrderDetailsPage(id: string) {
    return api.orders.details(id)
      .then(throwErrorsIfNotOk)
      .then(response => response.text())
      .catch(error => {
        rollbar.error("Error fetching order details data", {
          error: error,
          id: id,
        });
        throw error;
      });
  }

  getOrderManagePage(number: number) {
    return api.orders.manage(number)
      .then(throwErrorsIfNotOk)
      .then(response => response.text())
      .catch(error => {
        rollbar.error("Error fetching order manage data", {
          error: error,
          number: number,
        });
        throw error;
      });
  }

  acceptOrder(id: string) {
    return api.orders.action.accept(id)
      .then(throwErrorsIfNotOk)
      .catch(error => {
        rollbar.error("Error accepting order", {
          error: error,
          id: id,
        });
        throw error;
      });
  }

  rejectOrder(id: string) {
    return api.orders.action.reject(id)
      .then(throwErrorsIfNotOk)
      .catch(error => {
        rollbar.error("Error rejecting order", {
          error: error,
          id: id,
        });
        throw error;
      });
  }

  deliverOrder(id: string) {
    return api.orders.action.deliver(id)
      .then(throwErrorsIfNotOk)
      .catch(error => {
        rollbar.error("Error delivering order", {
          error: error,
          id: id,
        });
        throw error;
      });
  }
}

const server = new Server();
export default server;
