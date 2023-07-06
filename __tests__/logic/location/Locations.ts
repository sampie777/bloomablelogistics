import { Locations } from "../../../source/logic/location/Locations";
import { Recipient } from "../../../source/logic/orders/models";

describe("Location", () => {
  it("Converts wrongly written addresses to addresses with house numbers", () => {
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "123 street, somewhere, town", unit: "" } as Recipient)).toBe("123 street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "123 street,somewhere,town", unit: "" } as Recipient)).toBe("123 street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street 123,somewhere,town", unit: "" } as Recipient)).toBe("street 123, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere, town", unit: "" } as Recipient)).toBe("street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere, town", unit: "123" } as Recipient)).toBe("123, street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere, town", unit: "unit" } as Recipient)).toBe("street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere, town", unit: "unit 123" } as Recipient)).toBe("unit 123, street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "123 street, somewhere, town", unit: "unit 123" } as Recipient)).toBe("123 street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere 123, town, 0000", unit: "" } as Recipient)).toBe("street, somewhere 123, town, 0000");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere 123, town, 0000", unit: "123" } as Recipient)).toBe("123, street, somewhere 123, town, 0000");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "street, somewhere 123, town, 0000", unit: "unit" } as Recipient)).toBe("street, somewhere 123, town, 0000");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "123, street, somewhere, town", unit: "" } as Recipient)).toBe("123, street, somewhere, town");
    expect(Locations.fixWrongAddressWithoutHouseNumber({ address: "123, street, somewhere, town", unit: "123" } as Recipient)).toBe("123, street, somewhere, town");
  });
});
