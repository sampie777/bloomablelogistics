import { Notifications } from "../../source/logic/notifications";

describe("Notifications", () => {
  it("converts usernames to valid topic names", () => {
    expect(Notifications.convertUsernameToTopicName("username")).toBe("username");
    expect(Notifications.convertUsernameToTopicName("UserName")).toBe("username");
    expect(Notifications.convertUsernameToTopicName("  username  ")).toBe("username");
    expect(Notifications.convertUsernameToTopicName("user@email.com")).toBe("user-email.com");
    expect(Notifications.convertUsernameToTopicName("user/te,st;")).toBe("user-te-st-");
    expect(Notifications.convertUsernameToTopicName("user-te.st%")).toBe("user-te.st%");
  });
});
