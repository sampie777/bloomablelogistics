import { ordersDashboardResponse } from "../../resources/BloomableOrdersDashboardResponse";
import { orderDetails1Response } from "../../resources/BloomableOrderDetailsResponse1";
import { ServerHtml } from "../../../source/logic/bloomable/html";

describe("ServerHtml", () => {
  it("Parses HTML page with orders correctly", () => {
    const orders = ServerHtml.ordersResponseToOrders(ordersDashboardResponse);
    expect(orders.length).toBe(3);

    expect(orders[0].id).toBe("155153219240209190199110252079052160138224163153");
    expect(orders[0].number).toBe(2547219);
    expect(orders[0].clientName).toBe("Abcd Efgh");
    expect(orders[0].clientEmail).toBe("Abcd@gmail.com");
    expect(orders[0].clientPhones.length).toBe(1);
    expect(orders[0].clientPhones[0]).toBe("12345678");
    expect(orders[0].createdAt).toStrictEqual(new Date("2022-03-03T02:16:00"));
    expect(orders[0].deliverAtDate).toStrictEqual(new Date("2022-03-08"));
    expect(orders[0].orderValue).toBe(undefined);
    expect(orders[0].orderCosts).toBe(undefined);
    expect(orders[0].accepted).toBe(true);
    expect(orders[0].delivered).toBe(false);

    expect(orders[1].id).toBe("193171235017243217131173176211037156011121111008");
    expect(orders[1].number).toBe(2547288);
    expect(orders[1].clientName).toBe("DSFWE Asdf Jsdf2");
    expect(orders[1].clientEmail).toBe("DSFWE@email.com");
    expect(orders[1].clientPhones.length).toBe(2);
    expect(orders[1].clientPhones[0]).toBe("+27 (012) 801 1234");
    expect(orders[1].clientPhones[1]).toBe("+27 (012) 801 1235");
    expect(orders[1].createdAt).toStrictEqual(new Date("2022-03-03T09:46:00"));
    expect(orders[1].deliverAtDate).toStrictEqual(new Date("2022-03-04"));
    expect(orders[1].orderValue).toBe(undefined);
    expect(orders[1].orderCosts).toBe(undefined);
    expect(orders[1].accepted).toBe(true);
    expect(orders[1].delivered).toBe(false);

    expect(orders[2].id).toBe("120030035131247037118245192147044054135216106030");
    expect(orders[2].number).toBe(2547297);
    expect(orders[2].clientName).toBe("DSFWE Asdf Jsdf2");
    expect(orders[2].clientEmail).toBe("DSFWE@email.com");
    expect(orders[2].clientPhones.length).toBe(2);
    expect(orders[2].clientPhones[0]).toBe("+27 (012) 801 1234");
    expect(orders[2].clientPhones[1]).toBe("+27 (012) 801 1235");
    expect(orders[2].createdAt).toStrictEqual(new Date("2022-03-03T09:57:00"));
    expect(orders[2].deliverAtDate).toStrictEqual(new Date("2022-03-04"));
    expect(orders[2].orderValue).toBe(undefined);
    expect(orders[2].orderCosts).toBe(undefined);
    expect(orders[2].accepted).toBe(true);
    expect(orders[2].delivered).toBe(true);
  });

  it("Parses order details correctly", () => {
    const { recipient, orderValue } = ServerHtml.orderDetailsResponseToRecipient(orderDetails1Response);

    expect(recipient).not.toBeUndefined();
    expect(recipient!.name).toBe("ASdsf Ssdfs");
    expect(recipient!.phones.length).toBe(2);
    expect(recipient!.phones[0]).toBe("+27 123456789");
    expect(recipient!.phones[1]).toBe("+27 123456710");
    expect(recipient!.company).toBe("");
    expect(recipient!.unit).toBe("thisunit");
    expect(recipient!.address).toBe("123, Woodlands Avenue, Dinges Estate, Overthere, North West, 0123");
    expect(recipient!.message).toBe("Happy Birthday Gran! We hope you have a wonderful day! ❤\n" +
      "\n" +
      "Miss you loads!! \n" +
      "Lots of love,\n" +
      "\n" +
      "Abv, cdd & Dilan");
    expect(recipient!.specialInstructions).toBeUndefined();
    expect(orderValue).toBe(620);
  });
});
