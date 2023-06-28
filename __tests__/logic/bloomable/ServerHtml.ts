import { ordersDashboardResponse } from "../../resources/BloomableOrdersDashboardResponse";
import { orderDetails1Response } from "../../resources/BloomableOrderDetailsResponse1";
import { ServerHtml } from "../../../source/logic/bloomable/html";
import { orderDetailsWithSundryValueResponse } from "../../resources/BloomableOrderDetailsWithSundryValue";
import * as fs from "fs";
import * as path from "path";

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
    const { recipient, orderValue, products } = ServerHtml.orderDetailsResponseToOrderDetails(orderDetails1Response);

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

    expect(products).not.toBeUndefined();
    expect(products!.length).toBe(4);
    expect(products![0].extras?.length).toBe(0);
    expect(products![1].extras?.length).toBe(0);
    expect(products![2].extras?.length).toBe(0);

    expect(products![3].name).toBe("Orange Rose Bouquet");
    expect(products![3].size).toBe("Medium (12 Roses) - AS SHOWN");
    expect(products![3].quantity).toBe("x 1");
    expect(products![3].retailPrice).toBe(620);
    expect(products![3].guidelines).toBe("1 x Ribbon\n" +
      "1 x Additional Delivery Fee\n" +
      "2 x Tissue Paper Plain [ Mixed]\n" +
      "8 x Greenery [ Green]\n" +
      "12 x Roses [ Orange]");
    expect(products![3].description).toBe("Please email admin@gmail.com quoting your order number if there are any variations of flowers used in this creation. If the customer is informed of any changes you are more likely to receive better reviews. Thank you.");
    expect(products![3].image).toBe("https://www.bloomable.co.za/Uploads/Images/9f65fa64-4657-4abb-9e41-e3529a25ba4d.jpg");
    expect(products![3].extras?.length).toBe(1);
    expect(products![3].extras![0].name).toBe("Small Orange Rose Bouquet");
    expect(products![3].extras![0].description).toBe("Included in price above (R 115.00)");
    expect(products![3].extras![0].image).toBe("https://www.bloomable.co.za/Uploads/Images/7c7435c9-6ee6-4f13-9b8f-5a4f83fb2301.jpg");
  });

  it("Parses order details with a sundry value correctly", () => {
    const {
      recipient,
      orderValue,
      products,
    } = ServerHtml.orderDetailsResponseToOrderDetails(orderDetailsWithSundryValueResponse);

    expect(recipient).not.toBeUndefined();
    expect(recipient!.name).toBe("Maria Madelein");
    expect(recipient!.phones.length).toBe(1);
    expect(recipient!.phones[0]).toBe("+27 981515555");
    expect(recipient!.company).toBe("");
    expect(recipient!.unit).toBe("Premier Mats & Accesories");
    expect(recipient!.address).toBe("111, Moepel Street, Derdepoort 765-Jr, Pretoria, Gauteng, 0186");
    expect(recipient!.message).toBe("Happy birthday!\n" +
      "\n" +
      "New Zealand\n" +
      "\n" +
      "H\n" +
      "\n" +
      "XOXOXO");
    expect(recipient!.specialInstructions).toBe("R1210.05 added to the order for extra flowers. Customer requests please make it special");

    expect(orderValue).toBe(3640.05);

    expect(products).not.toBeUndefined();
    expect(products!.length).toBe(2);
    expect(products![0].extras?.length).toBe(0);
    expect(products![1].extras?.length).toBe(0);

    expect(products![0].name).toBe("My Heart's Desire");
    expect(products![0].size).toBe("50 Roses - AS SHOWN");
    expect(products![0].quantity).toBe("x 1");
    expect(products![0].retailPrice).toBe(2125);
    expect(products![0].guidelines).toBe("1 x Twyne [ Brown]\n" +
      "1 x Additional Delivery Fee\n" +
      "2 x Kraft Paper [ Brown]\n" +
      "10 x Greenery [ Green]\n" +
      "25 x Roses [ Red]\n" +
      "25 x Roses [ Dark Pink ]");
    expect(products![0].description).toBe("Please email admin@gmail.com quoting your order number if there are any variations of flowers used in this creation. If the customer is informed of any changes you are more likely to receive better reviews. Thank you. Please ensure 100% customer satisfaction.");
    expect(products![0].image).toBe("https://www.bloomable.co.za/Uploads/Images/080c261e-22e4-482b-9788-d3110e052496.jpg");

    expect(products![1].name).toBe("Lindor Cornet Milk");
    expect(products![1].size).toBe("200g");
    expect(products![1].quantity).toBe("x 1");
    expect(products![1].retailPrice).toBe(305);
    expect(products![1].guidelines).toBe("1 x Lindor Cornet Milk 200g [ 200 g/ml]");
    expect(products![1].description).toBe("");
    expect(products![1].image).toBe("https://www.bloomable.co.za/Uploads/Images/8fee7dae-d14a-4ba1-980a-427e60ba7ab5.jpg");
  });

  it("Parses order manage page to order status correctly for accepted but not delivered order", () => {
    const html = fs.readFileSync(path.join(__dirname, "../../resources/BloomableOrderActionsResponse1547309.html"), "utf-8");
    const {
      isAccepted,
      isDelivered,
    } = ServerHtml.orderManageResponseToOrderStatus(html);

    expect(isAccepted).toBe(true);
    expect(isDelivered).toBe(false);
  });

  it("Parses order manage page to order status correctly for accepted and delivered order", () => {
    const html = fs.readFileSync(path.join(__dirname, "../../resources/BloomableOrderActionsResponse1547321.html"), "utf-8");
    const {
      isAccepted,
      isDelivered,
    } = ServerHtml.orderManageResponseToOrderStatus(html);

    expect(isAccepted).toBe(true);
    expect(isDelivered).toBe(true);
  });
});
