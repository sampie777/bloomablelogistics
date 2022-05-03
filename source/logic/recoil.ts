import { atom, selector } from "recoil";
import { Order } from "./models";
import { Orders } from "./orders";
import { getNextDay } from "./utils";

export const ordersState = atom<Order[]>({
  key: "orders",
  default: [],
  effects: [
    ({ setSelf, trigger }) => {
      if (trigger === "get") {
        console.log("Get trigger for atom");
      }
    },
  ],
});

export const selectedDateState = atom<Date>({
  key: "selectedDate",
  default: new Date(),
});

export const selectedDateOrdersState = selector<Order[]>({
  key: "selectedDateOrders",
  get: ({ get }) => {
    const orders = get(ordersState);
    const selectedDate = get(selectedDateState);

    const startDate = new Date(selectedDate);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate = getNextDay(selectedDate);
    endDate.setHours(0);
    endDate.setMinutes(0);
    endDate.setSeconds(0);
    endDate.setMilliseconds(0);

    return Orders.sort(orders.filter(it => it.deliverAtDate &&
      startDate <= it.deliverAtDate && it.deliverAtDate < endDate));
  },
});

export const upcomingOrdersState = selector<Order[]>({
  key: "upcomingOrders",
  get: ({ get }) => {
    const orders = get(ordersState);
    const selectedDate = get(selectedDateState);

    const startDate = getNextDay(selectedDate);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    return Orders.sort(orders.filter(it => it.deliverAtDate &&
      startDate <= it.deliverAtDate));
  },
});
