import { getCookieValue } from "../../../../source/logic/bloomable/utils";

describe("getCookieValue", () => {
  it("extracts the correct key value pair", () => {
    const cookies = "XSRF-TOKEN=token%3D; expires=Mon, 03 Jul 2023 10:55:00 GMT; Max-Age=7200; path=/; samesite=lax, bloomable_session=session%3D; expires=Mon, 03 Jul 2023 10:55:00 GMT; Max-Age=7200; path=/; httponly; samesite=lax";
    expect(getCookieValue(cookies, "XSRF-TOKEN")).toBe("token%3D");
    expect(getCookieValue(cookies, "bloomable_session")).toBe("session%3D");
  });

  it("extracts cookies separated by newline or without expires attributes", () => {
    const cookies = "XSRF-TOKEN=demotoken%3D; Path=/\nbloomable_session=demosession%3D; Path=/";
    expect(getCookieValue(cookies, "XSRF-TOKEN")).toBe("demotoken%3D");
    expect(getCookieValue(cookies, "bloomable_session")).toBe("demosession%3D");
  });

  it("returns undefined when key is not present or string is empty", () => {
    expect(getCookieValue("", "XSRF-TOKEN")).toBeUndefined();
    expect(getCookieValue("other_key=value", "XSRF-TOKEN")).toBeUndefined();
  });
});
