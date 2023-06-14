import { rollbar } from "../rollbar";
import { api, throwErrorsIfNotOk } from "../api";
import { ServerHtml } from "./html";
import EncryptedStorage from "react-native-encrypted-storage";
import { emptyPromise } from "../utils";
import { Notifications } from "../notifications";

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

    const formData = "Referrer=&ReturnUrl=&ShowCreateAccountButton=True&Username=" + username + "&Password=" + password + "&RememberMe=true&RememberMe=false&X-Requested-With=XMLHttpRequest";

    return fetch(api.url.login(), {
      "credentials": "include",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      "body": formData,
      "method": "POST",
      "mode": "no-cors",
    })
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
          rollbar.warning(`Retrying login due to html response: '${html}'`);
          return this.login(username, password, maxRetries - 1);
        }
        throw new LoginError(message);
      })
      .catch(error => {
        if (!(error instanceof LoginError)) {
          rollbar.error(`Error logging in on server: ${error}`, error);
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
        rollbar.critical(`Error getting EncryptedStorage 'cookie' item: ${error}`, error);
      }).then(() =>
        EncryptedStorage.getItem("username")
          .then(value => {
            this.credentialsRecalled = true;
            if (value) {
              this.setUsername(value);
            }
          })
          .catch(error => {
            rollbar.critical(`Error getting EncryptedStorage 'username' item: ${error}`, error);
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
          rollbar.critical(`Error setting EncryptedStorage '${key}' item: ${error}`, error);
        });
    } else {
      EncryptedStorage.removeItem(key)
        .catch(error => {
          rollbar.error(`Error clearing EncryptedStorage '${key}' item: ${error}`, error);
        });
    }
  }

  getOrdersPage(page: number) {
    return fetch(api.url.orders(page))
      .then(throwErrorsIfNotOk)
      .then(response => response.text())
      .catch(error => {
        rollbar.error(`Error fetching orders data: ${error}`, error);
        throw error;
      });
  }

  getOrderDetailsPage(id: string) {
    return fetch(api.url.orderDetail(id))
      .then(throwErrorsIfNotOk)
      .then(response => response.text())
      .catch(error => {
        rollbar.error(`Error fetching order details data: ${error}`, error);
        throw error;
      });
  }
}

const server = new Server();
export default server;
