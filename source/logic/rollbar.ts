import { Callback, Client, Configuration, Extra, LogArgument, LogResult } from "rollbar-react-native";
import { getUniqueId, getVersion } from "react-native-device-info";
import Config from "react-native-config";
import { Platform } from "react-native";

const shouldRollbarBeEnabled = process.env.NODE_ENV === "production";
const configuration = new Configuration(
  Config.ROLLBAR_API_KEY || "",
  {
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: shouldRollbarBeEnabled,
    verbose: true,
    payload: {
      environment: process.env.NODE_ENV,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: getVersion() + "." + Platform.OS,
        },
      },
    },
    captureDeviceInfo: true,
  });

export const rollbar = new Client(configuration);

getUniqueId().then(value => rollbar.setPerson(value))
  .catch(error => rollbar.error("Could not get/set unique ID", { error: sanitizeErrorForRollbar(error)}));

if (!shouldRollbarBeEnabled) {
  const rollbarLogLocal = (logFunction: (...data: any[]) => void, obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => {
    if (extra === undefined) logFunction(obj);
    else logFunction(obj, extra);

    callback?.(null, {});
    return { uuid: "" };
  };

  rollbar.log = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.log, obj, extra, callback);
  rollbar.debug = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.debug, obj, extra, callback);
  rollbar.info = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.info, obj, extra, callback);
  rollbar.warning = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.warn, obj, extra, callback);
  rollbar.error = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, extra, callback);
  rollbar.critical = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, extra, callback);
}


export const sanitizeErrorForRollbar = <T>(error: T): {
  error: {
    original: T,
    json: string,
    name?: string | null,
    type?: string | null,
    message?: string | null,
    stack?: string | null
  }
} => {
  if (!(error instanceof Error)) {
    return {
      error: {
        original: error,
        json: JSON.stringify(error),
      },
    };
  }

  return {
    error: {
      original: error,
      name: error.name,
      type: error.constructor.name,
      message: error.message,
      stack: error.stack,
      json: JSON.stringify(error),
    },
  };
};