import { rollbar } from "../rollbar";
import { api, throwErrorsIfNotOk } from "../api";
import { ServerHtml } from "./html";
import EncryptedStorage from "react-native-encrypted-storage";

export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginError";
  }
}

class Server {
  private cookie: string | undefined = undefined;

  setCookie(value: string) {
    this.cookie = value;
  }

  login(username: string, password: string) {
    this.logout();
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

        this.storeCookie();

        return response.text();
      })
      .then(html => {
        if (this.isLoggedIn()) {
          return;
        }

        throw new LoginError(ServerHtml.loginResponseToError(html));
      })
      .catch(error => {
        if (!(error instanceof LoginError)) {
          rollbar.error(`Error logging in on server`, error);
        }
        throw error;
      });
  }

  private processCookie(cookies: string) {
    cookies.split(";")
      .filter(it => it.startsWith("SAFlorist="))
      .forEach(it => {
        const part = it.trim();
        this.cookie = part.substring("SAFlorist=".length, part.length);
      });
  }

  logout() {
    this.cookie = undefined;
    this.storeCookie();
  }

  isLoggedIn() {
    return this.cookie !== undefined;
  }

  getOrderPage(page: number) {
    return fetch(api.url.orders(page), {
      "headers": {},
    })
      .then(throwErrorsIfNotOk)
      .then(response => response.text())
      .catch(error => {
        rollbar.error(`Error fetching orders data`, error);
        throw error;
      });
  }

  recallCookie() {
    return EncryptedStorage.getItem("cookie")
      .then(value => {
        if (value) {
          this.setCookie(value);
        }
      })
      .catch(error => {
        rollbar.critical(`Error getting EncryptedStorage item: ${error}`, error);
      });
  }

  storeCookie() {
    if (this.cookie !== undefined) {
      EncryptedStorage.setItem("cookie", this.cookie)
        .catch(error => {
          rollbar.critical(`Error setting EncryptedStorage item: ${error}`, error);
        });
    } else {
      EncryptedStorage.removeItem("cookie")
        .catch(error => {
          rollbar.error(`Error clearing EncryptedStorage item: ${error}`, error);
        });
    }
  }
}

const server = new Server();
export default server;
