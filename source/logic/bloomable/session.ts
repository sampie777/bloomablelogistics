import { getCookieValue } from "./utils";

export interface Session {
  xsrfToken?: string;
  sessionToken?: string;
}

let activeSession: Session = {};

export const getSession = (): Session => {
  return {
    xsrfToken: activeSession?.xsrfToken,
    sessionToken: activeSession?.sessionToken,
  };
};

export const storeSession = (session: Session) => {
  activeSession = session;
};

export const getNewSession = (response: Response) => {
  const cookies = response.headers.get("Set-Cookie");
  if (cookies == null) {
    throw new Error("Didn't receive XSRF cookies");
  }

  return {
    xsrfToken: getCookieValue(cookies, "XSRF-TOKEN"),
    sessionToken: getCookieValue(cookies, "bloomable_session"),
  };
};

export const verifySession = (session: Session) => {
  if (session.xsrfToken == null) throw new Error("Didn't receive XSRF-TOKEN cookie");
  if (session.sessionToken == null) throw new Error("Didn't receive bloomable_session cookie");
};

export const sessionToHeader = (session: Session) => {
  return {
    "X-XSRF-TOKEN": `${session.xsrfToken?.replace("%3D", "=")}`,
    cookie: `XSRF-TOKEN: ${session.xsrfToken}; bloomable_session=${session.sessionToken}`,
  };
};
