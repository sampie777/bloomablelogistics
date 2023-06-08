import { settings } from "./settings";
import { rollbar } from "../rollbar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { emptyPromiseWithValue } from "../utils";

export namespace SettingsUtils {
  let _isLoaded = false;
  const reservedKeys = ["load", "store"];

  export const load = (obj: typeof settings) => {
    // Wait for all key loadings to complete
    Promise.all(
      Object.entries(obj)
        .map(([key, value]) => {
          if (reservedKeys.includes(key)) return;

          return loadValueFor(key, value)
            .then(dbValue => {
              if (dbValue !== undefined) {
                (obj as { [key: string]: any })[key] = dbValue;
              }
            })
            .catch(e => rollbar.error("Failed to get settings value from storage", { error: e, key: key }));
        }))
      .catch(e => rollbar.error("Failed to load settings from storage", { error: e }))
      .finally(() => {
        _isLoaded = true;
      });
  };

  export const store = (obj: typeof settings) => {
    if (!_isLoaded) {
      // Settings can't be stored, as they are not loaded yet.
      // Return to prevent settings from being reset by default values.
      return;
    }

    try {
      Object.entries(obj).forEach(([key, value]) => {
        if (reservedKeys.includes(key)) return;

        switch (typeof value) {
          case "string":
            return set(key, value);
          case "number":
            return setNumber(key, value);
          case "boolean":
            return setBoolean(key, value);
          default:
            rollbar.error("No matching set function found for storing type of key.", { key: key, type: typeof value });
        }
      });
    } catch (error: any) {
      rollbar.error("Failed to store settings", {
        error: error,
        errorType: error.constructor.name,
        settings: obj,
      });
    }
  };


  function set(key: string, value: string) {
    return AsyncStorage.setItem(key, value)
      .catch(e => rollbar.error("Failed to store settings value into storage", { error: e, key: key, value: value }));
  }

  function setNumber(key: string, value: number) {
    const stringValue = value.toString();
    return set(key, stringValue);
  }

  function setBoolean(key: string, value: boolean) {
    const stringValue = value.toString();
    return set(key, stringValue);
  }


  function loadValueFor(key: string, value: any): Promise<string | number | boolean | undefined> {
    switch (typeof value) {
      case "string":
        return get(key);
      case "number":
        return getNumber(key);
      case "boolean":
        return getBoolean(key);
      default:
        rollbar.error("No matching set function found for loading type of key.", { key: key, type: typeof value });
    }
    return emptyPromiseWithValue(undefined);
  }

  function get(key: string): Promise<string | undefined> {
    return AsyncStorage.getItem(key)
      .then(value => {
        if (value == null || value[0] === undefined) return undefined;
        return value;
      });
  }

  function getNumber(key: string): Promise<number | undefined> {
    return get(key)
      .then(stringValue => {
        if (stringValue === undefined) return undefined;

        const numberValue = +stringValue;
        if (isNaN(numberValue)) return undefined;
        return numberValue;
      });
  }

  function getBoolean(key: string): Promise<boolean | undefined> {
    return get(key)
      .then(stringValue => {
        if (stringValue === undefined) return undefined;

        return stringValue.toString() === "true";
      });
  }
}
