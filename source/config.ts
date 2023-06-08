export const config = {
  maxOrderPagesToFetch: 3,
  offlineData: process.env.NODE_ENV !== "production" && false,

  ordersListSwipeMinXOffset: 50,
  ordersListSwipeMaxYOffset: 20,
};
