import { Linking, Platform, ScaledSize } from "react-native";
import { rollbar, sanitizeErrorForRollbar } from "../rollbar";

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

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return _format
    .replace(/%dddd/g, days[date.getUTCDay()])
    .replace(/%dd/g, date.getUTCDate().toString().padStart(2, "0"))
    .replace(/%d/g, date.getUTCDate().toString())
    .replace(/%mm/g, (date.getUTCMonth() + 1).toString().padStart(2, "0"))
    .replace(/%m/g, (date.getUTCMonth() + 1).toString())
    .replace(/%YYYY/g, date.getUTCFullYear().toString())
    .replace(/%YY/g, (date.getUTCFullYear() % 100).toString())
    .replace(/%Y/g, date.getUTCFullYear().toString())
    .replace(/%HH/g, date.getUTCHours().toString().padStart(2, "0"))
    .replace(/%H/g, date.getUTCHours().toString())
    .replace(/%MM/g, date.getUTCMinutes().toString().padStart(2, "0"))
    .replace(/%M/g, date.getUTCMinutes().toString())
    .replace(/%SS/g, date.getUTCSeconds().toString().padStart(2, "0"))
    .replace(/%S/g, date.getUTCSeconds().toString())
    .replace(/%f/g, date.getUTCMilliseconds().toString().padStart(3, "0"));
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

export const isUpcomingWeek = (ref: Date, date: Date): boolean => {
  if (isToday(ref, date)) {
    return true;
  }

  if (date.getTime() < ref.getTime()) {
    return false;
  }

  const weekEndDate = new Date(ref.getTime() + 7 * 24 * 60 * 60 * 1000);
  weekEndDate.setHours(0);
  weekEndDate.setMinutes(0);
  weekEndDate.setSeconds(0);
  weekEndDate.setMilliseconds(0);

  return date.getTime() < weekEndDate.getTime();
};

export const getPreviousDay = (ref: Date): Date => new Date(ref.getTime() - 24 * 60 * 60 * 1000);
export const getNextDay = (ref: Date): Date => new Date(ref.getTime() + 24 * 60 * 60 * 1000);

export const emptyPromise = (): Promise<null> => new Promise((resolve => resolve(null)));
export const emptyPromiseWithValue = <T>(v: T): Promise<T> => new Promise((resolve => resolve(v)));
export const delayedPromiseWithValue = <T>(v: T, delay: number = 1000): Promise<T> =>
  new Promise((resolve => setTimeout(() => resolve(v), delay)));

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
        rollbar.info("Failed to open URL", { ...sanitizeErrorForRollbar(error), url: url });
      } else {
        rollbar.warning("Failed to open URL", { ...sanitizeErrorForRollbar(error), url: url });
      }
      throw error;
    });
}

export const isAndroid = Platform.OS === "android";
export const isIOS = Platform.OS === "ios";

export class ValidationError extends Error {
}

export function validate(result: boolean, message?: string) {
  if (result) {
    return;
  }
  throw new ValidationError(message || "Value is not true");
}

export const hashCyrb53 = (input: string, seed = 0): string => {
  let h1 = 0xDEADBEEF ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < input.length; i++) {
    ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 326649909);
  h2 = Math.imul(h2 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h1 >>> 13), 326649909);
  const output = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return output.toString();
};

export const htmlToString = (html: string): string => {
  return html
    .replace(/\n/gi, "")
    .replace(/<(p|div|h1|h2|h3|h4|h5).*?>/gi, "\n")
    .replace(/<br*?>/gi, "\n")
    .replace(/<.*?>/gi, "")
    .replace(/ /gi, " ")
    .replace(/[ \t]+/gi, " ")
    .trim();
};
