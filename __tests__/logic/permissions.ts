import { Permissions } from "../../source/logic/permissions";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";

describe("Permissions", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
  });

  describe("askPermission", () => {
    it("returns false immediately on non-Android platforms without calling PermissionsAndroid", async () => {
      Platform.OS = "ios";
      const result = await Permissions.askPermission("android.permission.ACCESS_FINE_LOCATION" as any);
      expect(result).toBe(false);
    });
  });

  describe("askNotificationPermission", () => {
    it("requests permission via messaging on iOS", async () => {
      Platform.OS = "ios";
      const result = await Permissions.askNotificationPermission();
      expect(result).toBe(true);
      expect(messaging().requestPermission).toHaveBeenCalled();
    });

    it("handles Android notification permission", async () => {
      Platform.OS = "android";
      Platform.Version = 30; // Pre-Android 13
      const result = await Permissions.askNotificationPermission();
      expect(result).toBe(true);
    });
  });
});
