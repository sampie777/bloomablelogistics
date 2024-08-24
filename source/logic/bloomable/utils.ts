export const getCookieValue = (cookies: string, key: string): string | undefined => {
  const cookie = cookies.split(",")
    .flatMap(it => it.split(";"))
    .find(it => it.trim().startsWith(`${key}=`));

  if (!cookie) return undefined;

  const part = cookie.trim();
  return part.substring(`${key}=`.length, part.length);
};
