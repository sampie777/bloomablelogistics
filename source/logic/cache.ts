import { Cache } from "react-native-cache";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const locationCache = new Cache({
  namespace: "locations",
  policy: {
    maxEntries: 50000, // if unspecified, it can have unlimited entries
    stdTTL: 365 * 24 * 3600, // the standard ttl as number in seconds, default: 0 (unlimited)
  },
  backend: AsyncStorage,
});
