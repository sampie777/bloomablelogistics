import { NativeModules } from "react-native";
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

export const clearNativeCookies = (): void => {
  try {
    if (NativeModules?.Networking?.clearCookies) {
      NativeModules.Networking.clearCookies(() => {});
    }
  } catch {
    // Ignore error if NativeModules or clearCookies is not available
  }
};

export const clearSession = () => {
  activeSession = {};
  clearNativeCookies();
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
  const decodedXsrf = session.xsrfToken ? decodeURIComponent(session.xsrfToken) : "";
  const cookieParts: string[] = [];
  if (session.xsrfToken) {
    cookieParts.push(`XSRF-TOKEN=${session.xsrfToken}`);
  }
  if (session.sessionToken) {
    cookieParts.push(`bloomable_session=${session.sessionToken}`);
  }
  const headers: Record<string, string> = {
    "X-XSRF-TOKEN": `${decodedXsrf}`,
  };
  if (cookieParts.length > 0) {
    headers.Cookie = cookieParts.join("; ");
  }
  return headers;
};
