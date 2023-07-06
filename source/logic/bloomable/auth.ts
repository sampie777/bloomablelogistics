import { getNewSession, getSession, Session, sessionToHeader, storeSession, verifySession } from "./session";
import { obtainResponseContent } from "./utils";
import { HttpCode } from "../utils/http";
import { rollbar } from "../rollbar";

export namespace BloomableAuth {

  export class LoginError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "LoginError";
    }
  }

  export interface Credentials {
    username: string;
    password: string;
  }

  export const getXSRFCookies = (): Promise<Session> => {
    return fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie")
      .then(response => {
        const session = getNewSession(response);
        verifySession(session);
        storeSession(session);
        return session;
      })
      .catch(e => {
        rollbar.error("Could not get XSRF tokens", { error: e });
        throw e;
      });
  };

  export const logout = (): Promise<unknown> => {
    return fetch("https://dashboard.bloomable.com/api/logout", {
      headers: {
        "Accept": "application/json",
        ...sessionToHeader(getSession()),
      },
      method: "POST",
    })
      .then(response => {
        storeSession(getNewSession(response));

        if (response.status !== HttpCode.NoContent) {
          rollbar.warning(`Failed to log out: ${response.status}`);
        }
      })
      .catch(e => {
        rollbar.error("Failed to log out", { error: e });
      });
  };

  export const login = (credentials: Credentials): Promise<Session> =>
    getXSRFCookies()
      .then(logout)
      .then(() => {
        return fetch("https://dashboard.bloomable.com/api/login", {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...sessionToHeader(getSession()),
          },
          body: `{"email":"${credentials.username}","password":"${credentials.password}"}`,
          method: "POST",
        });
      })
      .then(response => {
        if (response.status === HttpCode.OK) {
          const session = getNewSession(response);
          verifySession(session);
          storeSession(session);
          return session;
        }

        return obtainResponseContent(response).then(content => {
          const stringifiedContent = JSON.stringify(content);
          if (response.status === HttpCode.NoContent) {
            throw new Error(`Logged in with no content. Payload: ${stringifiedContent}`);
          } else if (response.status === HttpCode.UnprocessableContent) {
            throw new LoginError(`Auth error. Payload: ${stringifiedContent}`);
          } else if (response.status === HttpCode.PageExpired) {
            throw new Error(`XSRF failed. Payload: ${stringifiedContent}`);
          }
          throw new Error(`No idea whats going on (status=${response.status}). Payload: ${stringifiedContent}`);
        });
      })
      .catch(e => {
        rollbar.error("Could not log in", { error: e });
        throw e;
      });

  export const authenticatedFetch = (credentials: Credentials, url: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    const call = () => {
      init.headers = {
        ...init.headers,
        ...sessionToHeader(getSession()),
      };
      return fetch(url, init);
    };

    return call()
      .then(response => {
        if (response.status === HttpCode.Unauthorized) {
          return login(credentials)
            .then(session => storeSession(session))
            .then(call);
        }
        return response;
      })
      .then(response => {
        storeSession(getNewSession(response));
        return response;
      });
  };
}
