import { Order } from "../models";
import { rollbar } from "../rollbar";
import { emptyPromise, emptyPromiseWithValue } from "../utils";
import Geocoder from "react-native-geocoding";
import Config from "react-native-config";

Geocoder.init(Config.GOOGLE_MAPS_API_KEY);

export interface Location {
  key: any,
  latitude: number,
  longitude: number,
  order: Order,
}

export namespace Locations {
  export const locationsForOrders = (orders: Order[]): Promise<Location[]> => {
    return getLocationsForOrders(orders.filter(it => it.recipient?.address), []);
  };

  export const getLocationsForOrders = (orders: Order[], locations: Location[]): Promise<Location[]> => {
    const nextOrder = orders.find(it => !locations.some(location => location.order === it));
    if (nextOrder === undefined) {
      return emptyPromiseWithValue(locations);
    }

    return Locations.getLocationForOrder(nextOrder)
      .then((location) => {
        if (location) {
          locations.push(location);
        }
        return getLocationsForOrders(orders, locations);
      });
  };

  export const getLocationForOrder = (order: Order): Promise<Location | null> => {
    if (!order.recipient?.address) {
      return emptyPromise();
    }

    return googleMapsGeoCode(order.recipient!.address)
      .then((coordinates) => {
        if (coordinates == null) {
          return null;
        }
        return {
          key: order.id || (Math.random() * 1000).toString(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          order: order,
        } as Location;
      });
  };

  export const googleMapsGeoCode = (address: string): Promise<{ latitude: number, longitude: number } | null> => {
    return Geocoder.from(address)
      .then((result) => {
        if (result.results.length === 0) {
          return null;
        }

        const coordinates = result.results[0].geometry.location;
        return {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
        };
      })
      .catch(error => {
        rollbar.error(`Failed to get results from Google geocoder for address '${address}': ${error}`, error);
        return null;
      });
  };
}
