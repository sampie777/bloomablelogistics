import { Order } from "../models";
import { rollbar } from "../rollbar";
import { emptyPromise, emptyPromiseWithValue } from "../utils";
import Geocoder from "react-native-geocoding";
import Config from "react-native-config";
import { config } from "../config";
const openrouteservice = require("openrouteservice-js");

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

    return getGeoCode(order.recipient!.address)
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

  export const getGeoCode = (address: string): Promise<{ latitude: number, longitude: number } | null> => {
    if (config.useOpenRouteService) {
      return openRouteServiceGeoCode(address);
    } else {
      return googleMapsGeoCode(address);
    }
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
        rollbar.error(`Failed to get results from Google geocoder for address ${address}: ${error}`, error);
        return null;
      });
  };

  export const openRouteServiceGeoCode = (address: string): Promise<{ latitude: number, longitude: number } | null> => {
    const geoCoder = new openrouteservice.Geocode({ api_key: Config.OPEN_ROUTES_SERVICE_API_KEY });
    return geoCoder.geocode({
      text: address,
      boundary_country: ["ZA"],
    })
      .then((result: any) => {
        if (result.features.length === 0) {
          return null;
        }

        const coordinates = result.features[0].geometry.coordinates as number[];
        return {
          latitude: coordinates[0],
          longitude: coordinates[1],
        };
      })
      .catch((error: any) => {
        rollbar.error(`Failed to get results from Google geocoder for address ${address}: ${error}`, error);
        return null;
      });
  };
}
