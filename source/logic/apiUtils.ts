import { rollbar } from "./rollbar";
import { HttpCode, HttpError } from "./utils/http";

export const throwErrorsIfNotOk = (response: Response) => {
  if (response.ok) {
    return response;
  }

  rollbar.error("API request failed", {
    url: response.url,
    status: response.status,
    statusText: response.statusText,
  });
  switch (response.status) {
    case HttpCode.NotFound:
      throw new HttpError(`Could not find the requested data: (${response.status}) ${response.statusText}`, response);
    case HttpCode.Unauthorized:
      throw new HttpError(`Could not retrieve the requested data: (${response.status}) Not authorized.`, response);
    case HttpCode.Forbidden:
      throw new HttpError(`Could not retrieve the requested data: (${response.status}) Not authorized.`, response);
    case HttpCode.Gone:
      throw new HttpError(`Server says resource is gone (${response.status})..`, response);
    case HttpCode.TooManyRequests:
      throw new HttpError(`Too many request (${response.status}).`, response);
    case HttpCode.InternalServerError:
      throw new HttpError(`Could not connect to server: (${response.status}) Internal server error`, response);
    default:
      throw new HttpError(`Request failed: (${response.status}) ${response.statusText}`, response);
  }
};
