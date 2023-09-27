import { OrderStatus } from "./models";

export namespace Status {
  export const toReadableActionText = (status: OrderStatus): string => {
    switch (status) {
      case "open":
        return "Accept or reject";
      case "cancelled":
        return "Re-accept";
      case "cancel-confirmed":
        return "Cancelled";
      case "accepted":
        return "Dispatch";
      case "fulfilled":
        return "Confirm delivery";
      case "delivered":
        return "Delivered";
    }
    return status;
  };

  export const sortValueForStatus = (status: OrderStatus) => {
    switch (status) {
      case "open":
        return 0;
      case "cancelled":
        return 4;
      case "cancel-confirmed":
        return 5;
      case "accepted":
        return 1;
      case "fulfilled":
        return 2;
      case "delivered":
        return 3;
    }
    return -1;
  };
}
