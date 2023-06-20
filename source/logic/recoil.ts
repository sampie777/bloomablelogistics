import { atom, RecoilEnv, selector } from "recoil";
import { Order } from "./models";
import { Orders } from "./orders";
import { getNextDay } from "./utils";

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;

export const ordersState = atom<Order[]>({
  key: "orders",
  default: [],
});

export const selectedDateState = atom<Date>({
  key: "selectedDate",
  default: new Date(),
});

export const ordersOutdatedState = atom<boolean>({
  key: "ordersOutdated",
  default: true,
});

export const orderActionInProgressState = atom<boolean>({
  key: "orderActionInProgress",
  default: false,
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
