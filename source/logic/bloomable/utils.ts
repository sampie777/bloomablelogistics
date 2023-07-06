import { rollbar } from "../rollbar";

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
  if (contentType === "application/json") return response.json().catch(e => {
    rollbar.error("Could not convert response to json", e);
    return "";
  });
  return response.text().catch(e => {
    rollbar.error("Could not convert response to text", e);
    return "";
  });
};
