import { Client, Configuration } from "rollbar-react-native";
import { getUniqueId, getVersion } from "react-native-device-info";

const configuration = new Configuration(
  "de2d7d5406834a59814740bac636faff",
  {
    captureUncaught: true,
    captureUnhandledRejections: true,
    enabled: process.env.NODE_ENV === "production",
    verbose: true,
    payload: {
      environment: process.env.NODE_ENV,
      client: {
        javascript: {
          source_map_enabled: true,
          code_version: getVersion(),
        },
      },
    },
  });

export const rollbar = new Client(configuration);

getUniqueId().then(value => rollbar.setPerson(value))
  .catch(e => console.error(e));
