import { rollbar, sanitizeErrorForRollbar } from "../rollbar";

export const HttpCode = {
  OK: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  NotAcceptable: 406,
  Gone: 410,
  PageExpired: 419,
  UnprocessableContent: 422,
  FailedDependency: 424,
  TooManyRequests: 429,
  InternalServerError: 500,
};

export class HttpError extends Error {
  name = "HttpError";
  response?: Response;

  constructor(message?: string, response?: Response) {
    super(message);
    this.response = response;
  }
}

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
