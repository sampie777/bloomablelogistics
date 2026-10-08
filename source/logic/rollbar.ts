import { Callback, Client, Configuration, Extra, LogArgument, LogResult } from "rollbar-react-native";
import { getUniqueId, getVersion } from "react-native-device-info";
import Config from "react-native-config";
import { Platform } from "react-native";

export type DemoStatus = "demo" | "normal";

let demoStatusProvider: (() => boolean) | null = null;
let manualDemoStatus: boolean | null = null;

export const setDemoStatusProvider = (provider: () => boolean) => {
  demoStatusProvider = provider;
};

export const setDemoStatus = (isDemo: boolean | null) => {
  manualDemoStatus = isDemo;
};

export const getIsDemo = (): boolean => {
  if (manualDemoStatus !== null) {
    return manualDemoStatus;
  }
  if (demoStatusProvider !== null) {
    try {
      return Boolean(demoStatusProvider());
    } catch {
      return false;
    }
  }
  return false;
};

export const getDemoStatus = (): DemoStatus => {
  return getIsDemo() ? "demo" : "normal";
};

export const getDemoMetadata = () => {
  const isDemo = getIsDemo();
  return {
    is_demo: isDemo,
    demo_status: (isDemo ? "demo" : "normal") as DemoStatus,
  };
};

export const enrichExtraWithDemoStatus = (extra?: Extra): Extra => {
  const metadata = getDemoMetadata();
  if (extra === undefined || extra === null) {
    return metadata;
  }
  if (typeof extra === "object") {
    return {
      ...metadata,
      ...extra,
    };
  }
  return {
    ...metadata,
    extra: extra,
  };
};

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
    transform: (data: any) => {
      const metadata = getDemoMetadata();
      data.custom = {
        ...data.custom,
        ...metadata,
      };
      if (metadata.is_demo) {
        if (!data.person) {
          data.person = { id: "demo", username: "demo" };
        } else if (!data.person.username) {
          data.person.username = "demo";
        }
      }
    },
    captureDeviceInfo: true,
  });

export const rollbar = new Client(configuration);

getUniqueId().then(value => rollbar.setPerson(value))
  .catch(error => rollbar.error("Could not get/set unique ID", { error: sanitizeErrorForRollbar(error)}));

// Wrap Rollbar log methods to automatically inject demo status metadata
const originalLog = rollbar.log.bind(rollbar);
const originalDebug = rollbar.debug.bind(rollbar);
const originalInfo = rollbar.info.bind(rollbar);
const originalWarning = rollbar.warning.bind(rollbar);
const originalError = rollbar.error.bind(rollbar);
const originalCritical = rollbar.critical.bind(rollbar);

rollbar.log = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult =>
  originalLog(obj, enrichExtraWithDemoStatus(extra), callback);
rollbar.debug = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult =>
  originalDebug(obj, enrichExtraWithDemoStatus(extra), callback);
rollbar.info = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult =>
  originalInfo(obj, enrichExtraWithDemoStatus(extra), callback);
rollbar.warning = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult =>
  originalWarning(obj, enrichExtraWithDemoStatus(extra), callback);
rollbar.error = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult =>
  originalError(obj, enrichExtraWithDemoStatus(extra), callback);
rollbar.critical = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult =>
  originalCritical(obj, enrichExtraWithDemoStatus(extra), callback);

if (!shouldRollbarBeEnabled) {
  const rollbarLogLocal = (logFunction: (...data: any[]) => void, obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => {
    logFunction(obj, extra);

    callback?.(null, {});
    return { uuid: "" };
  };

  rollbar.log = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.log, obj, enrichExtraWithDemoStatus(extra), callback);
  rollbar.debug = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.debug, obj, enrichExtraWithDemoStatus(extra), callback);
  rollbar.info = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.info, obj, enrichExtraWithDemoStatus(extra), callback);
  rollbar.warning = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.warn, obj, enrichExtraWithDemoStatus(extra), callback);
  rollbar.error = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, enrichExtraWithDemoStatus(extra), callback);
  rollbar.critical = (obj: LogArgument, extra?: Extra, callback?: Callback): LogResult => rollbarLogLocal(console.error, obj, enrichExtraWithDemoStatus(extra), callback);
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
