import {
  clearNativeCookies,
  clearSession,
  getNewSession,
  getSession,
  Session,
  sessionToHeader,
  storeSession,
  verifySession,
} from "./session";
import { HttpCode, obtainResponseContent } from "../utils/http";
import { rollbar, sanitizeErrorForRollbar } from "../rollbar";
import { delayedPromiseWithValue } from "../utils/utils";

export namespace BloomableAuth {

  export class LoginError extends Error {
    payload?: any;
    constructor(message: string, payload?: any) {
      super(message);
      this.name = "LoginError";
      this.payload = payload;
    }
  }

  export const parseLoginErrorMessage = (content: any, defaultMessage: string = "These credentials do not match our records."): string => {
    if (!content) return defaultMessage;
    if (typeof content === "string") {
      try {
        content = JSON.parse(content);
      } catch {
        return content.trim() || defaultMessage;
      }
    }
    if (content.errors && typeof content.errors === "object") {
      for (const key of Object.keys(content.errors)) {
        const err = content.errors[key];
        if (Array.isArray(err) && err.length > 0 && typeof err[0] === "string" && err[0].trim().length > 0) {
          return err[0].trim();
        } else if (typeof err === "string" && err.trim().length > 0) {
          return err.trim();
        }
      }
    }
    if (typeof content.message === "string" && content.message.trim().length > 0) {
      return content.message.trim();
    }
    return defaultMessage;
  };

  export interface Credentials {
    username: string;
    password: string;
  }

  export const getXSRFCookies = (): Promise<Session> => {
    clearNativeCookies();
    return fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie", {
      credentials: "omit",
    })
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
  };

  export const logout = (): Promise<unknown> => {
    const session = getSession();
    const headers = {
      "Accept": "application/json",
      ...sessionToHeader(session),
    };

    return fetch("https://dashboard.bloomable.com/api/logout", {
      headers: headers,
      method: "POST",
      credentials: "omit",
    })
      .then(response => {
        try {
          const newSession = getNewSession(response);
          if (newSession.xsrfToken && newSession.sessionToken) {
            storeSession(newSession);
          }
        } catch {
          // ignore
        }

        // 204 NoContent is standard success.
        // 401 Unauthorized indicates the session is already unauthenticated/expired, which is also an effective logout.
        if (response.status !== HttpCode.NoContent && response.status !== HttpCode.Unauthorized) {
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
  };

  export const login = (credentials: Credentials, retries: number = 2): Promise<Session> => {
    if (credentials.username === "demo" && credentials.password === "demo") {
      rollbar.info("Demo account logged in");
      return delayedPromiseWithValue({}, 1000);
    }

    clearSession();
    return getXSRFCookies()
      .then(() => fetch("https://dashboard.bloomable.com/api/login", {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...sessionToHeader(getSession()),
        },
        body: `{"email":"${credentials.username}","password":"${credentials.password}"}`,
        method: "POST",
        credentials: "omit",
      }))
      .then(response => {
        const originalSession = getSession();

        if (response.status === HttpCode.OK) {
          try {
            const session = getNewSession(response);
            verifySession(session);
            storeSession(session);
            return session;
          } catch {
            if (originalSession.xsrfToken && originalSession.sessionToken) {
              return originalSession;
            }
          }
        }

        return obtainResponseContent(response).then(content => {
          if (response.status === HttpCode.PageExpired && retries > 0) {
            return login(credentials, retries - 1);
          }
          if (response.status === HttpCode.UnprocessableContent) {
            const parsedMessage = parseLoginErrorMessage(content);
            throw new LoginError(parsedMessage, content);
          }
          throw new Error(`Failed to log in (${response.status}). ${parseLoginErrorMessage(content, "")}`);
        });
      })
      .catch(error => {
        if (!(error instanceof LoginError)) {
          rollbar.error("Could not log in", sanitizeErrorForRollbar(error));
        }
        throw error;
      });
  };

  export const authenticatedFetch = (credentials: Credentials, url: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    const call = () => {
      init.headers = {
        ...init.headers,
        ...sessionToHeader(getSession()),
      };
      return fetch(url, {
        ...init,
        credentials: "omit",
      });
    };

    return call()
      .then(response => {
        if (response.status === HttpCode.Unauthorized && credentials.username.length > 0 && credentials.password.length > 0) {
          return login(credentials)
            .then(call);
        }
        return response;
      });
  };
}
