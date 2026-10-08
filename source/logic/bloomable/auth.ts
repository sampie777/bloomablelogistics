import { getNewSession, getSession, Session, sessionToHeader, storeSession, verifySession } from "./session";
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
        try {
          storeSession(getNewSession(response));
        } catch {
          // ignore
        }

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
        const originalSession = getSession();
        const session = getNewSession(response);
        storeSession(session);

        if (response.status === HttpCode.OK) {
          verifySession(session);
          return session;
        }

        return obtainResponseContent(response)
          .then(content => {
            const stringifiedContent = JSON.stringify(content);
            if (response.status === HttpCode.NoContent) {
              throw new Error(`Logged in with no content. Payload: ${stringifiedContent}`);
            } else if (response.status === HttpCode.UnprocessableContent) {
              throw new LoginError(parseLoginErrorMessage(content), content);
            } else if (response.status === HttpCode.Unauthorized) {
              throw new LoginError(parseLoginErrorMessage(content), content);
            } else if (response.status === HttpCode.TooManyRequests) {
              throw new LoginError(parseLoginErrorMessage(content, "Too many login attempts. Please try again later."), content);
            } else if (response.status === HttpCode.PageExpired) {
              throw new LoginError("Session expired. Please try again.", content);
            } else if (response.status === HttpCode.NotAcceptable && stringifiedContent.includes("Already authenticated")) {
              storeSession(originalSession);
              return session;
            }
            throw new Error(`Login failed (status=${response.status}). Payload: ${stringifiedContent}`);
          });
      })
      .catch(error => {
        if (!(error instanceof LoginError)) {
          rollbar.error("Could not log in", {
            ...sanitizeErrorForRollbar(error),
            errorMessage: error ? error.message : undefined,
          });
        }
        throw error;
      });
  };

  export const authenticatedFetch = async (credentials: Credentials, url: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    const call = () => {
      init.headers = {
        ...init.headers,
        ...sessionToHeader(getSession()),
      };
      return fetch(url, init);
    };

    const maxRetries = 4;
    for (let retry = 0; retry < maxRetries; retry++) {
      try {
        const response = await call();
        if (response.status === HttpCode.Unauthorized) {
          try {
            await login(credentials);
          } catch (error) {
            rollbar.debug("Failed to do login", { ...sanitizeErrorForRollbar(error), retry: retry });
          }
          continue; // Retry
        }

        if (response.status < 200 || response.status >= 300) {
          rollbar.warning("Got non OK status for call", {
            url: url,
            response: {
              ok: response.ok,
              status: response.status,
              statusText: response.statusText,
              type: response.type,
              headers: response.headers,
              content: JSON.stringify(await obtainResponseContent(response)),
            },
          });
        }

        try {
          const newSession = getNewSession(response);
          if (newSession.xsrfToken || newSession.sessionToken) {
            storeSession(newSession);
          }
        } catch {
          // Set-Cookie is optional on subsequent API calls
        }

        return response;
      } catch (error) {
        rollbar.error("Failed to do call", {
          ...sanitizeErrorForRollbar(error),
          retry: retry,
          maxRetries: maxRetries,
          url: url,
        });

        if (retry === maxRetries - 1) throw error;
      }
    }

    rollbar.error("Fell out of authenticatedFetch retry loop", {
      maxRetries: maxRetries,
      url: url,
    });
    throw Error("Failed to perform request. Please try again.");
  };
}
