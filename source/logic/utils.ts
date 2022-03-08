import { Linking, Platform, ScaledSize } from "react-native";
import { rollbar } from "./rollbar";

export function dateFrom(date: Date | string): Date {
  if (typeof date === "string") {
    return new Date(date);
  }
  return date;
}

export function format(date: Date | string | undefined, _format: string) {
  if (date === undefined) {
    return "";
  }

  date = dateFrom(date);

  return _format
    .replace(/%dd/g, date.getDate().toString().padStart(2, "0"))
    .replace(/%d/g, date.getDate().toString())
    .replace(/%mm/g, (date.getMonth() + 1).toString().padStart(2, "0"))
    .replace(/%m/g, (date.getMonth() + 1).toString())
    .replace(/%YYYY/g, date.getFullYear().toString())
    .replace(/%YY/g, (date.getFullYear() % 100).toString())
    .replace(/%Y/g, date.getFullYear().toString())
    .replace(/%HH/g, date.getHours().toString().padStart(2, "0"))
    .replace(/%H/g, date.getHours().toString())
    .replace(/%MM/g, date.getMinutes().toString().padStart(2, "0"))
    .replace(/%M/g, date.getMinutes().toString())
    .replace(/%SS/g, date.getSeconds().toString().padStart(2, "0"))
    .replace(/%S/g, date.getSeconds().toString())
    .replace(/%f/g, date.getMilliseconds().toString().padStart(3, "0"));
}

export const formatDateToWords = (date: Date | string | undefined, defaultFormat: string) => {
  if (date === undefined) {
    return "unknown";
  }

  const now = new Date();
  date = dateFrom(date);
  if (isToday(now, date)) {
    return "today";
  } else if (isTomorrow(now, date)) {
    return "tomorrow";
  } else if (isYesterday(now, date)) {
    return "yesterday";
  }
  return format(date, defaultFormat);
};

export const isToday = (ref: Date, date: Date): boolean => {
  return date.getFullYear() === ref.getFullYear() && date.getMonth() === ref.getMonth() && date.getDate() === ref.getDate();
};

export const isTomorrow = (ref: Date, date: Date): boolean => {
  return isToday(new Date(ref.getTime() + 24 * 60 * 60 * 1000), date);
};

export const isYesterday = (ref: Date, date: Date): boolean => {
  return isToday(new Date(ref.getTime() - 24 * 60 * 60 * 1000), date);
};

export const emptyPromise = (): Promise<null> => new Promise((resolve => resolve(null)));
export const emptyPromiseWithValue = <T>(v: T): Promise<T> => new Promise((resolve => resolve(v)));

export function capitalize(word: string) {
  if (word.length === 0) {
    return word;
  }

  if (word.length === 1) {
    return word.toUpperCase();
  }

  return word.charAt(0).toUpperCase() + word.substring(1);
}

export function isPortraitMode(window: ScaledSize) {
  return window.height >= window.width;
}

export function openLink(url: string): Promise<any> {
  return Linking.canOpenURL(url)
    .then(isSupported => {
      if (isSupported) {
        return Linking.openURL(url);
      } else {
        throw new Error("Can't open URL '" + url + "': your device can't open these type of URLs.");
      }
    })
    .catch(error => {
      if (error !== undefined && error.message !== undefined && `${error.message}`.startsWith("Can't open Url '")) {
        rollbar.info(error);
      } else {
        rollbar.warning(error);
      }
      throw error;
    });
}

export const isAndroid = Platform.OS === "android";

export class ValidationError extends Error {
}

export function validate(result: boolean, message?: string) {
  if (result) {
    return;
  }
  throw new ValidationError(message || "Value is not true");
}
