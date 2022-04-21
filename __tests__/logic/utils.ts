import { hashCyrb53 } from "../../source/logic/utils";

describe("utils", () => {
  it("hashes with cyrb53 should give constant unique outputs", () => {
    expect(hashCyrb53("input")).toBe("3743319409793976");
    expect(hashCyrb53("input2")).toBe("5368841239920390");
    expect(hashCyrb53("input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input ")).toBe("1630753028750031");
    expect(hashCyrb53("input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input2")).toBe("2188106625373050");
    expect(hashCyrb53("input", 1)).toBe("7954722364506017");
    expect(hashCyrb53("input")).toBe("3743319409793976");
  });
});
