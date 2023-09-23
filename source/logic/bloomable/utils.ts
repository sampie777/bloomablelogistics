import { rollbar, sanitizeErrorForRollbar } from "../rollbar";

export const getCookieValue = (cookies: string, key: string): string | undefined => {
  const cookie = cookies.split(",")
    .flatMap(it => it.split(";"))
    .find(it => it.trim().startsWith(`${key}=`));

  if (!cookie) return undefined;

  const part = cookie.trim();
  return part.substring(`${key}=`.length, part.length);
};

export const obtainResponseContent = (response: Response): Promise<string> => {
  const contentType = response.headers.get("content-type");
  if (contentType === "application/json") return response.json().catch(error => {
    rollbar.error("Could not convert response to json", sanitizeErrorForRollbar(error));
    return "";
  });
  return response.text().catch(error => {
    rollbar.error("Could not convert response to text", sanitizeErrorForRollbar(error));
    return "";
  });
};
