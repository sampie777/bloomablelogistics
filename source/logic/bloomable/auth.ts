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
    rollbar.log("Getting XSRF cookies");
    return fetch("https://dashboard.bloomable.com/sanctum/csrf-cookie")
      .then(response => {
        const session = getNewSession(response);
        verifySession(session);
        return session;
      })
      .catch(e => {
        rollbar.error("Could not get XSRF tokens", { error: e });
        throw e;
      });
  };

  export const login = (credentials: Credentials): Promise<Session> =>
    getXSRFCookies()
      .then(session => {
        rollbar.debug(`Logging in for ${credentials.username}`);
        return fetch("https://dashboard.bloomable.com/api/login", {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            ...sessionToHeader(session),
          },
          body: `{"email":"${credentials.username}","password":"${credentials.password}"}`,
          method: "POST",
        });
      })
      .then(response => {
        if (response.status === HttpCode.OK) {
          const session = getNewSession(response);
          verifySession(session);

          rollbar.log("Logging in successful");
          return session;
        }

        return obtainResponseContent(response).then(content => {
          if (response.status === HttpCode.NoContent) {
            throw new Error(`Logged in with no content. Payload: ${content}`);
          } else if (response.status === HttpCode.UnprocessableContent) {
            throw new LoginError(`Auth error. Payload: ${JSON.stringify(content)}`);
          } else if (response.status === HttpCode.PageExpired) {
            throw new Error(`XSRF failed. Payload: ${content}`);
          }
          throw new Error(`No idea whats going on (status=${response.status}). Payload: ${content}`);
        });
      })
      .catch(e => {
        rollbar.error("Could not log in", { error: e });
        throw e;
      });

  export const authenticatedFetch = (credentials: Credentials, url: RequestInfo, init: RequestInit = {}): Promise<Response> => {
    const call = () => {
      const session: Session = getSession(credentials);
      init.headers = {
        ...init.headers,
        ...sessionToHeader(session),
      };
      return fetch(url, init);
    };

    return call()
      .then(response => {
        if (response.status === HttpCode.Unauthorized) {
          rollbar.log("Not logged in. Retrying call with logging in.");
          return login(credentials)
            .then(session => storeSession(credentials, session))
            .then(call);
        }
        return response;
      })
      .then(response => {
        storeSession(credentials, getNewSession(response));
        return response;
      });
  };
}
