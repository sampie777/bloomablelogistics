import {
  format,
  formatDateToWords,
  getNextDay,
  getPreviousDay,
  hashCyrb53,
  htmlToString,
} from "../../source/logic/utils/utils";

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

  it("htmlToString", () => {
    expect(htmlToString("<meta charset=\"utf-8\">\n<p><strong>A pure white and green bouquet perfect for sympathy occasions or for someone in your life that loves classic white flowers.  </strong></p>\n<p>Flowers included in this beautiful creation may differ subject to seasonal and flower market availability. Our team will inform you if there are any major changes but we will do our best to ensure that it looks like what you see on our website.</p>\n<p><span>Thank you for supporting local South African florists. #SupportLocal</span></p>"))
      .toBe("A pure white and green bouquet perfect for sympathy occasions or for someone in your life that loves classic white flowers. \nFlowers included in this beautiful creation may differ subject to seasonal and flower market availability. Our team will inform you if there are any major changes but we will do our best to ensure that it looks like what you see on our website.\nThank you for supporting local South African florists. #SupportLocal");
  });
});
