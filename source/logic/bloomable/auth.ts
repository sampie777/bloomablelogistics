import { getNewSession, getSession, Session, sessionToHeader, storeSession, verifySession } from "./session";
import { obtainResponseContent } from "./utils";
import { HttpCode } from "../utils/http";
import { rollbar, sanitizeErrorForRollbar } from "../rollbar";
import { delayedPromiseWithValue } from "../utils";

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

  export const getXSRFCookies = (): Promise<Session> =>
    fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie")
      .then(response => {
        if (response.status !== HttpCode.NoContent) {
          obtainResponseContent(response)
            .then(content => JSON.stringify(content))
            .catch(error => error)
            .then(content =>
              rollbar.info("Received unexpected status code from XSRF cookie request", {
                statusCode: response.status,
                content: content,
              }));
        }

        const session = getNewSession(response);
        verifySession(session);
        storeSession(session);
        return session;
      })
      .catch(error => {
        rollbar.error("Could not get XSRF tokens", sanitizeErrorForRollbar(error));
        throw error;
      });

  export const logout = (): Promise<unknown> =>
    getXSRFCookies()
      .then(() => fetch("https://dashboard.bloomable.com/api/logout", {
        headers: {
          "Accept": "application/json",
          ...sessionToHeader(getSession()),
        },
        method: "POST",
      }))
      .then(response => {
        storeSession(getNewSession(response));

        if (response.status !== HttpCode.NoContent) {
          obtainResponseContent(response)
            .then(content => JSON.stringify(content))
            .catch(error => error)
            .then(content =>
              rollbar.warning("Failed to log out", {
                statusCode: response.status,
                content: content,
              }));
        }
      })
      .catch(error => {
        rollbar.error("Failed to log out", sanitizeErrorForRollbar(error));
      });

  export const login = (credentials: Credentials): Promise<Session> => {
    if (credentials.username === "demo" && credentials.password === "demo") {
      rollbar.info("Demo account logged in");
      return delayedPromiseWithValue({}, 1000);
    }

    return getXSRFCookies()
      .then(() => fetch("https://dashboard.bloomable.com/api/login", {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...sessionToHeader(getSession()),
        },
        body: `{"email":"${credentials.username}","password":"${credentials.password}"}`,
        method: "POST",
      }))
      .then(response => {
        const session = getNewSession(response);
        storeSession(session);

        if (response.status === HttpCode.OK) {
          verifySession(session);
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
      .catch(error => {
        rollbar.error("Could not log in", {
          ...sanitizeErrorForRollbar(error),
          errorMessage: error ? error.message : undefined,
        });
        throw error;
      });
  };

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
