import { Notifications } from "../../source/logic/notifications";
import { Platform } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { isEmulatorSync } from "react-native-device-info";

describe("Notifications", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Platform.OS = originalPlatform;
    jest.clearAllMocks();
  });

  it("converts usernames to valid topic names", () => {
    expect(Notifications.convertUsernameToTopicName("username")).toBe("username");
    expect(Notifications.convertUsernameToTopicName("UserName")).toBe("username");
    expect(Notifications.convertUsernameToTopicName("  username  ")).toBe("username");
    expect(Notifications.convertUsernameToTopicName("user@email.com")).toBe("user-email.com");
    expect(Notifications.convertUsernameToTopicName("user/te,st;")).toBe("user-te-st-");
    expect(Notifications.convertUsernameToTopicName("user-te.st%")).toBe("user-te.st%");
  });

  it("does not call subscribeToTopic on iOS simulator without APNS", async () => {
    Platform.OS = "ios";
    isEmulatorSync.mockReturnValue(true);

    const { Server } = require("../../source/logic/bloomable/server");
    jest.spyOn(Server, "isLoggedIn").mockReturnValue(true);
    jest.spyOn(Server, "getCredentials").mockReturnValue({ username: "testuser" });

    await Notifications.subscribe();

    expect(messaging().subscribeToTopic).not.toHaveBeenCalled();
  });

  it("calls subscribeToTopic on iOS physical device when APNS token is present", async () => {
    Platform.OS = "ios";
    isEmulatorSync.mockReturnValue(false);

    const { Server } = require("../../source/logic/bloomable/server");
    jest.spyOn(Server, "isLoggedIn").mockReturnValue(true);
    jest.spyOn(Server, "getCredentials").mockReturnValue({ username: "testuser" });

    await Notifications.subscribe();

    expect(messaging().subscribeToTopic).toHaveBeenCalledWith("testuser");
  });
});
