import { BloomableAuth } from "../../../source/logic/bloomable/auth";

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
