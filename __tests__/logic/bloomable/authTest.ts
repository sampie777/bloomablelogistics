import { BloomableAuth } from "../../../source/logic/bloomable/auth";
import { sessionToHeader } from "../../../source/logic/bloomable/session";
import { HttpCode } from "../../../source/logic/utils/http";

describe("BloomableAuth.parseLoginErrorMessage", () => {
  it("extracts message from standard Bloomable/Laravel 422 credential error", () => {
    const payload = {
      message: "These credentials do not match our records.",
      errors: {
        email: ["These credentials do not match our records."],
      },
    };
    expect(BloomableAuth.parseLoginErrorMessage(payload)).toBe("These credentials do not match our records.");
  });

  it("extracts specific field validation errors when present", () => {
    const payload = {
      message: "The given data was invalid.",
      errors: {
        email: ["The email must be a valid email address."],
      },
    };
    expect(BloomableAuth.parseLoginErrorMessage(payload)).toBe("The email must be a valid email address.");
  });

  it("extracts top-level message when errors object is missing", () => {
    const payload = {
      message: "Too many login attempts. Please try again in 60 seconds.",
    };
    expect(BloomableAuth.parseLoginErrorMessage(payload)).toBe("Too many login attempts. Please try again in 60 seconds.");
  });

  it("parses JSON stringified payload", () => {
    const stringified = JSON.stringify({
      message: "These credentials do not match our records.",
      errors: {
        email: ["These credentials do not match our records."],
      },
    });
    expect(BloomableAuth.parseLoginErrorMessage(stringified)).toBe("These credentials do not match our records.");
  });

  it("handles plain string message", () => {
    expect(BloomableAuth.parseLoginErrorMessage("Unauthorized access")).toBe("Unauthorized access");
  });

  it("falls back to default message when payload is null or empty", () => {
    expect(BloomableAuth.parseLoginErrorMessage(null)).toBe("These credentials do not match our records.");
    expect(BloomableAuth.parseLoginErrorMessage({})).toBe("These credentials do not match our records.");
    expect(BloomableAuth.parseLoginErrorMessage(null, "Custom fallback")).toBe("Custom fallback");
  });

  it("instantiates LoginError with clean message and payload", () => {
    const error = new BloomableAuth.LoginError("These credentials do not match our records.", { status: 422 });
    expect(error.name).toBe("LoginError");
    expect(error.message).toBe("These credentials do not match our records.");
    expect(error.payload).toEqual({ status: 422 });
  });
});

describe("sessionToHeader", () => {
  it("formats X-XSRF-TOKEN and Cookie header correctly", () => {
    const headers = sessionToHeader({
      xsrfToken: "token%3D",
      sessionToken: "session-123",
    });

    expect(headers["X-XSRF-TOKEN"]).toBe("token=");
    expect(headers.Cookie).toBe("XSRF-TOKEN=token%3D; bloomable_session=session-123");
  });

  it("omits missing token fields cleanly", () => {
    const headersEmpty = sessionToHeader({});
    expect(headersEmpty["X-XSRF-TOKEN"]).toBe("");
    expect(headersEmpty.Cookie).toBeUndefined();

    const headersXsrfOnly = sessionToHeader({ xsrfToken: "abc" });
    expect(headersXsrfOnly.Cookie).toBe("XSRF-TOKEN=abc");
  });
});

describe("BloomableAuth.login", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends credentials: 'omit' to prevent iOS native cookie clashing", async () => {
    const mockCsrfHeaders = new Headers();
    mockCsrfHeaders.set("Set-Cookie", "XSRF-TOKEN=token%3D; Path=/, bloomable_session=sess%3D; Path=/");

    const mockLoginSuccessHeaders = new Headers();
    mockLoginSuccessHeaders.set("Set-Cookie", "XSRF-TOKEN=new-token; Path=/, bloomable_session=new-sess; Path=/");

    const fetchMock = jest.fn().mockImplementation((url: string, init?: RequestInit) => {
      if (url.includes("/sanctum/csrf-cookie")) {
        expect(init?.credentials).toBe("omit");
        return Promise.resolve({
          status: 204,
          headers: mockCsrfHeaders,
        });
      }
      if (url.includes("/api/login")) {
        expect(init?.credentials).toBe("omit");
        return Promise.resolve({
          status: HttpCode.OK,
          headers: mockLoginSuccessHeaders,
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });

    global.fetch = fetchMock;

    const credentials = { username: "user@example.com", password: "password" };
    await BloomableAuth.login(credentials);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("retries on HttpCode.PageExpired (419) and succeeds if retry succeeds", async () => {
    const mockCsrfHeaders = new Headers();
    mockCsrfHeaders.set("Set-Cookie", "XSRF-TOKEN=valid-token; Path=/, bloomable_session=valid-session; Path=/");

    const mockLoginSuccessHeaders = new Headers();
    mockLoginSuccessHeaders.set("Set-Cookie", "XSRF-TOKEN=new-token; Path=/, bloomable_session=new-session; Path=/");

    let loginAttempt = 0;
    const fetchMock = jest.fn().mockImplementation((url: string) => {
      if (url.includes("/sanctum/csrf-cookie")) {
        return Promise.resolve({
          status: 204,
          headers: mockCsrfHeaders,
        });
      }
      if (url.includes("/api/login")) {
        loginAttempt++;
        if (loginAttempt === 1) {
          return Promise.resolve({
            status: HttpCode.PageExpired,
            headers: new Headers(),
            json: () => Promise.resolve({ message: "CSRF token mismatch." }),
          });
        }
        return Promise.resolve({
          status: HttpCode.OK,
          headers: mockLoginSuccessHeaders,
        });
      }
      return Promise.reject(new Error(`Unexpected url: ${url}`));
    });

    global.fetch = fetchMock;

    const credentials = { username: "user@example.com", password: "password" };
    const session = await BloomableAuth.login(credentials);

    expect(session.xsrfToken).toBe("new-token");
    expect(session.sessionToken).toBe("new-session");
    expect(loginAttempt).toBe(2);
  });
});

describe("BloomableAuth.authenticatedFetch", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("returns 401 response without attempting login when credentials are empty", async () => {
    const mockResponse = {
      status: 401,
      headers: new Headers(),
    };
    const fetchMock = jest.fn().mockResolvedValue(mockResponse);
    global.fetch = fetchMock;

    const emptyCredentials = { username: "", password: "" };
    const response = await BloomableAuth.authenticatedFetch(emptyCredentials, "https://dashboard.bloomable.com/api/product-variants/1173");

    expect(response.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
