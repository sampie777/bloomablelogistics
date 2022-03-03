export const throwErrorsIfNotOk = (response: Response) => {
  if (response.ok) {
    return response;
  }
  switch (response.status) {
    case 404:
      throw Error(`Could not find the requested data: (${response.status}) ${response.statusText}`);
    case 401:
    case 403:
      throw Error(`Could not retrieve the requested data: (${response.status}) Not authorized.`);
    case 500:
      throw Error(`Could not connect to server: (${response.status}) Internal server error`);
    default:
      throw Error(`Request failed: (${response.status}) ${response.statusText}`);
  }
};

export const api = {
  url: {
    login: () => "https://www.bloomable.co.za/Login/LoginPost",
    orders: (page: number) => `https://www.bloomable.co.za/???page=${page}`,
  },
};
