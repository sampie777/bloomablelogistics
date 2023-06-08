import { format, formatDateToWords, getNextDay, getPreviousDay, hashCyrb53 } from "../../source/logic/utils";

describe("utils", () => {
  it("hashes with cyrb53 should give constant unique outputs", () => {
    expect(hashCyrb53("input")).toBe("3743319409793976");
    expect(hashCyrb53("input2")).toBe("5368841239920390");
    expect(hashCyrb53("input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input ")).toBe("1630753028750031");
    expect(hashCyrb53("input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input input 1 input # input2")).toBe("2188106625373050");
    expect(hashCyrb53("input", 1)).toBe("7954722364506017");
    expect(hashCyrb53("input")).toBe("3743319409793976");
  });

  it("converts date to words", () => {
    expect(formatDateToWords(new Date(), "%dd-%mm-%YYYY")).toBe("today");
    expect(formatDateToWords(getNextDay(new Date()), "%dd-%mm-%YYYY")).toBe("tomorrow");
    expect(formatDateToWords(getPreviousDay(new Date()), "%dd-%mm-%YYYY")).toBe("yesterday");
    expect(formatDateToWords(new Date(Date.UTC(2017, 0, 2)), "%dd-%mm-%YYYY")).toBe("02-01-2017");
  });

  it("converts date to format", () => {
    expect(format(new Date(Date.UTC(2017, 0, 2)), "%dd-%mm-%YYYY")).toBe("02-01-2017");
    expect(format(new Date(Date.UTC(2017, 0, 2)), "%dddd")).toBe("monday");
  });
});
