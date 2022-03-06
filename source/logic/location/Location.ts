import { Order } from "../models";
import { rollbar } from "../rollbar";
import { emptyPromise, emptyPromiseWithValue } from "../utils";
import Geocoder from "react-native-geocoding";
import { LatLng } from "react-native-maps";
import Config from "react-native-config";

Geocoder.init(Config.GOOGLE_MAPS_API_KEY);

export namespace Location {
  export const ordersToMapOrders = (orders: Order[], callback?: (orders: Order[]) => void) => {
    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    const upcoming = orders
      .filter(it => it.recipient?.address)
      .filter(it => it.deliverAtDate && it.deliverAtDate.getTime() > now.getTime() && !it.delivered);

    getCoordinatesForOrders(upcoming)
      .then(_orders => callback?.(_orders));
  };

  export const getCoordinatesForOrders = (orders: Order[]): Promise<Order[]> => {
    const nextOrder = orders.find(it => it.recipient?.location === undefined);
    if (nextOrder === undefined) {
      return emptyPromiseWithValue(orders);
    }

    return Location.getCoordinatesForOrder(nextOrder)
      .then(() => getCoordinatesForOrders(orders));
  };

  export const getCoordinatesForOrder = (order: Order): Promise<any> => {
    if (!order.recipient?.address) {
      return emptyPromise();
    }

    if (order.recipient.location) {
      return emptyPromise();
    }

    return Geocoder.from(order.recipient!.address)
      .then((result) => {
        if (result.results.length === 0) {
          return;
        }

        const location = result.results[0].geometry.location;
        order.recipient!.location = {
          latitude: location.lat,
          longitude: location.lng,
        } as LatLng;
      })
      .catch(error => {
        rollbar.error(`Failed to get results from geocoder for order ${order.number}: ${error}`, error);
      });
  };
}
