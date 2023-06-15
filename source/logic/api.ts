
export const api = {
  url: {
    login: () => "https://www.bloomable.co.za/Login/LoginPost",
    orders: (page: number) => `https://www.bloomable.co.za/Code/Orders/Dashboard?SortByField=DeliveryDate&SortByDirection=DESC&page=${page}`,
    orderDetail: (id: string) => `https://www.bloomable.co.za/Code/Orders/Summary?orderId=${id}`,
  },
};
