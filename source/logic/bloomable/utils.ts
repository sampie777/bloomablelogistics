import { rollbar, sanitizeErrorForRollbar } from "../rollbar";

export const getCookieValue = (cookies: string, key: string): string | undefined => {
  const cookie = cookies.split(",")
    .flatMap(it => it.split(";"))
    .find(it => it.trim().startsWith(`${key}=`));

  if (!cookie) return undefined;

  const part = cookie.trim();
  return part.substring(`${key}=`.length, part.length);
};

export const obtainResponseContent = async (response: Response): Promise<any> => {
  const contentType = response.headers.get("content-type");
  try {
    if (contentType === "application/json") {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    rollbar.error("Could not convert response", {
      ...sanitizeErrorForRollbar(error),
      contentType: contentType,
      url: response.url,
      status: response.status,
      statusText: response.statusText,
    });
    return "";
  }
};
