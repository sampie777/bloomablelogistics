export const getCookieValue = (cookies: string, key: string): string | undefined => {
  if (!cookies) return undefined;
  // Match key=value where value is terminated by semicolon, newline, comma, or end of string
  const match = cookies.match(new RegExp(`(?:^|[\\n,;\\s])${key}=([^;\\n\\r]+)`));
  if (!match) return undefined;
  return match[1].trim();
};
