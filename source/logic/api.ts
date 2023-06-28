export const api = {
  auth: {
    login: (username: string, password: string) => fetch("https://www.bloomable.co.za/Login/LoginPost", {
      "credentials": "include",
      "headers": {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      "body": "Referrer=&ReturnUrl=&ShowCreateAccountButton=True&Username=" + username + "&Password=" + password + "&RememberMe=true&RememberMe=false&X-Requested-With=XMLHttpRequest",
      "method": "POST",
      "mode": "no-cors",
    }),
  },
  orders: {
    list: (page: number) => fetch(`https://www.bloomable.co.za/Code/Orders/Dashboard?SortByField=DeliveryDate&SortByDirection=DESC&page=${page}`),
    details: (id: string) => fetch(`https://www.bloomable.co.za/Code/Orders/Summary?orderId=${id}`),
    manage: (number: number) => fetch(`https://www.bloomable.co.za/code/orders/orderactions/${number}`),
    action: {
      accept: (id: string) => fetch(`https://www.bloomable.co.za/AutoProcess/SaveOrderAsAccepted?encryptedOrderId=${id}`),
      reject: (id: string) => fetch(`https://www.bloomable.co.za/AutoProcess/SaveOrderAsAccepted?encryptedOrderId=${id}&rejected=True`),
      deliver: (id: string) => fetch(`https://www.bloomable.co.za/AutoProcess/SaveOrderAsDispatched?encryptedOrderId=${id}`),
    },
  },
};
