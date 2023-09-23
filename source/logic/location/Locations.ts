import { Order, Recipient } from "../orders/models";
import { rollbar } from "../rollbar";
import { emptyPromise, emptyPromiseWithValue, hashCyrb53 } from "../utils";
import Geocoder from "react-native-geocoding";
import Config from "react-native-config";
import { locationCache } from "../cache";
import { settings } from "../settings/settings";

Geocoder.init(Config.GOOGLE_MAPS_API_KEY ?? "");

export interface Location {
  key: any,
  latitude: number,
  longitude: number,
  orders: Order[],
}

interface Coordinate {
  latitude: number,
  longitude: number,
}

export namespace Locations {
  export const locationsForOrders = (orders: Order[], useSmartAddress = false): Promise<Location[]> => {
    return getLocationsForOrders(
      orders.filter(it => it.recipient && (it.recipient.address || it.recipient.coordinates) && !(it.status === "cancelled" || it.status === "cancel-confirmed")),
      [],
      useSmartAddress,
    )
      .then(locations => mergeOrdersByLocation(locations));
  };

  export const getLocationsForOrders = (orders: Order[], locations: Location[], useSmartAddress = false): Promise<Location[]> => {
    const nextOrder = orders.find(it => !locations.some(location => location.orders.includes(it)));
    if (nextOrder === undefined) {
      return emptyPromiseWithValue(locations);
    }

    return Locations.getLocationForOrder(nextOrder, useSmartAddress)
      .then((location) => {
        if (location) {
          locations.push(location);
        }
        return getLocationsForOrders(orders, locations);
      });
  };

  export const getLocationForOrder = (order: Order, useSmartAddress = false): Promise<Location | null> => {
    if (settings.useInitialCoordinatesForOrders && order.recipient && order.recipient.coordinates) {
      return emptyPromiseWithValue({
        key: order.id || (Math.random() * 1000).toString(),
        latitude: order.recipient.coordinates.latitude,
        longitude: order.recipient.coordinates.longitude,
        orders: [order],
      } as Location);
    }

    const address = useSmartAddress
      ? fixWrongAddressWithoutHouseNumber(order.recipient)
      : order.recipient?.address;

    if (!address) {
      return emptyPromise();
    }

    return getCoordinatesForAddress(address)
      .then((coordinates) => {
        if (coordinates == null) {
          return null;
        }
        return {
          key: order.id || (Math.random() * 1000).toString(),
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          orders: [order],
        } as Location;
      });
  };

  export const getCoordinatesForAddress = (address: string): Promise<Coordinate | null> => {
    return getFromCache(address)
      .then(coordinates => {
        if (coordinates) {
          return coordinates;
        }
        return googleMapsGeoCode(address);
      })
      .then(coordinates => {
        if (coordinates) {
          storeInCache(address, coordinates);
        }
        return coordinates;
      });
  };

  export const getFromCache = (address: string): Promise<Coordinate | null> => {
    return locationCache.get(hashCyrb53(address))
      .then(result => {
        if (!result) {
          return null;
        }
        return JSON.parse(result);
      })
      .catch(error => {
        rollbar.error("Failed to get results from location cache for address", {
          error: error,
          address: address,
        });
        return null;
      });
  };

  export const storeInCache = (address: string, coordinates: Coordinate) => {
    if (!address) {
      return;
    }

    locationCache.set(hashCyrb53(address), JSON.stringify(coordinates))
      .catch(error => {
        rollbar.error("Failed to store location in location cache for address", {
          error: error,
          address: address,
          coordinates: coordinates,
        });
      });
  };

  export const googleMapsGeoCode = (address: string): Promise<Coordinate | null> => {
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
        rollbar.error("Failed to get results from Google geocoder for address", {
          error: error,
          address: address,
        });
        return null;
      });
  };

  export const mergeOrdersByLocation = (locations: Location[]): Location[] => {
    const result: Location[] = [];
    locations.forEach(location => {
      const match = result.find(it => overlap(it, location));

      if (match) {
        // Merge these orders into one location
        match.orders = match.orders.concat(location.orders);
      } else {
        // Add as new location
        result.push(location);
      }
    });
    result.forEach(it => {
      it.key = it.key + "_" + it.orders.length;
    });
    return result;
  };

  export const overlap = (a: Location, b: Location): boolean => {
    return a.latitude === b.latitude && a.longitude === b.longitude;
  };

  export const allOrdersDelivered = (location: Location): boolean => {
    return location.orders.every(it => it.status === "fulfilled" || it.status === "delivered");
  };

  export const fixWrongAddressWithoutHouseNumber = (recipient?: Recipient | null): string => {
    if (!recipient) {
      return "";
    }

    const addressParts = recipient.address
      .split(",")
      .map(it => it.trim());

    if (addressParts.length === 0) {
      return recipient.unit;
    }

    // If first part includes a number, it probably is the house number
    if (addressParts[0].match(new RegExp("\\d+", "i"))) {
      return addressParts.join(", ");
    }

    // Else if unit includes a number, than that must be the house number
    if (recipient.unit.match(new RegExp("\\d+", "i"))) {
      return [recipient.unit, ...addressParts].join(", ");
    }

    // We can't decipher this strange address
    return addressParts.join(", ");
  };
}
