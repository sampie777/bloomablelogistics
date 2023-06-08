import server from "../../../source/logic/bloomable/server";

describe("Server", () => {
  it("Processes cookies correctly when multiple cookies are given", () => {
    server.setCookie("");
    server.processCookie("ASP.NET_SessionId=asdfasfs; path=/; HttpOnly; SameSite=Lax, ASP.NET_SessionId=asfdasfdw; path=/; HttpOnly; SameSite=Lax, SAFlorist=averylongcookie; expires=Sun, 09-Mar-2042 16:43:09 GMT; path=/; HttpOnly");
    expect(server.getCookie()).toBe("averylongcookie");
  });
  it("Processes cookies correctly with only one cookie", () => {
    server.setCookie("");
    server.processCookie("SAFlorist=averylongcookie; expires=Sun, 09-Mar-2042 16:43:09 GMT; path=/; HttpOnly");
    expect(server.getCookie()).toBe("averylongcookie");
  });
});
