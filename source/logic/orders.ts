import server from "./bloomable/server";
import { ServerHtml } from "./bloomable/html";
import { config } from "../config";
import { dateFrom, emptyPromiseWithValue } from "./utils";
import { Order, Recipient } from "./models";

export namespace Orders {
  let fetchedOrders: Order[] = [];

  export const fetchPage = (page: number = 1): Promise<Order[]> => {
    if (config.offlineData) {
      const orders = [
        {
          "partner": "Bloomable",
          "clientName": "Arthur V. West",
          "clientPhones": ["+27 852853694"],
          "accepted": true,
          "delivered": false,
          "deleted": false,
          "id": "113169168178106194088095165162205054186220247982",
          "number": 2547543,
          "createdAt": dateFrom("2022-03-04T12:25:00.000Z"),
          "clientEmail": "ArthurVWest@jourrapide.com",
          "deliverAtDate": new Date(),
          "paymentType": "Credit Card",
          "orderValue": 555,
          "orderCosts": 476.2,
          "recipient": {
            "name": "Mrs Lisa Pearlman",
            "phones": ["+27 821743365", "+27 852853694"],
            "company": "Private Home",
            "unit": "846 Oost St",
            "address": "The Orks Security Estate, Clarinet's Loop, The Wilds, Belfast, Gauteng, 1192",
            "specialInstructions": "Security gate",
            "message": "Dear Mama and P Family\n\nNephew; Get well soon. My thoughts and prayers are with you Mr and Mrs P!!!! GOD Bless your Beloved Child. \n\nBest Wishes, SDKGxoxoxoxoxo",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/215a8573-ad89-4cdd-9289-edf315dc8dae.jpg",
            "name": "My Dear",
            "size": "Small - AS SHOWN",
            "quantity": "x 1",
            "retailPrice": 250,
            "guidelines": "1 x Square Lipped Vase [ Medium]\n1 x Additional Delivery Fee\n2 x Aster [ White]\n3 x Wax [ White]\n3 x Snapdragons [ White]\n5 x Greenery [ Green]\n5 x Roses [ White]",
            "description": "",
          }, {
            "image": "https://www.bloomable.co.za/Uploads/Images/f72c1a1f-74ec-4f36-a790-f0d8821ab7a8.jpg",
            "name": "Teddy Bear & Cadbury's Bubbles",
            "size": "Medium",
            "quantity": "x 1",
            "retailPrice": 250,
            "guidelines": "1 x Teddy Bear [ Medium]\n1 x Cadbury's Bubbly 150g [ 150 g/ml]",
            "description": "",
          }, {
            "image": "https://www.bloomable.co.za/Uploads/Images/2fa160fa-4d86-494e-911e-f4d230a134d9.jpg",
            "name": "Get Well Soon Foil Balloon",
            "size": "(Design May Vary)",
            "quantity": "x 1",
            "retailPrice": 55,
            "guidelines": "1 x Foil Balloon Get Well Soon",
            "description": "Please ensure that FOIL balloons and NOT latex balloons are used.",
          }],
        }, {
          "partner": "Bloomable",
          "clientName": "Gerry Keurntjes",
          "clientPhones": ["8290451"],
          "accepted": true,
          "delivered": true,
          "deleted": false,
          "id": "184213248202154200025196008229168100172166158978",
          "number": 2547405,
          "createdAt": dateFrom("2022-03-03T02:04:00.000Z"),
          "clientEmail": "GerryKeurntjes@teleworm.us",
          "deliverAtDate": new Date(),
          "paymentType": "Credit Card",
          "orderValue": 615,
          "orderCosts": 521.21,
          "recipient": {
            "name": "Efekan Dotinga",
            "phones": ["+27 8290451", "+27 8290451"],
            "company": "Harold's",
            "unit": "2270 Bodenstein Montana Pretoria",
            "address": "2270 Bodenstein St, Montana, Pretoria, Gauteng, 0151",
            "message": "May the hands of the Lord rest upon you as you recover and heal.\n\nfrom Gerry Keurntjes",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/92a76e84-4a73-4c51-a908-ff863f30bdc7.jpg",
            "name": "Peachy Pride Bouquet",
            "size": "Small",
            "quantity": "x 1",
            "retailPrice": 615,
            "guidelines": "1 x Kraft Paper [ Brown]\n1 x Twyne [ Brown]\n1 x Additional Delivery Fee\n2 x Golden Rod [ Yellow]\n2 x Snapdragons [ Orange]\n2 x Gerberas [ Orange]\n2 x Alstromeria [ Orange]\n3 x Roses [ Orange]\n4 x Chrysanthemums [ Orange]\n8 x Greenery [ Green]",
            "description": "Please email care@bloomable.co.za quoting your order number if there are any variations of flowers used in this creation. If the customer is informed of any changes you are more likely to receive better reviews. Thank you. Please ensure 100% customer satisfaction.",
          }],
        }, {
          "partner": "Bloomable",
          "clientName": "Katharina Bijlsma",
          "clientPhones": ["0748911187"],
          "accepted": true,
          "delivered": true,
          "deleted": false,
          "id": "226135159027228067237165231068003005250041163031",
          "number": 2547321,
          "createdAt": dateFrom("2022-03-03T10:28:00.000Z"),
          "clientEmail": "KatharinaBijlsma@rhyta.com",
          "deliverAtDate": new Date(),
          "paymentType": "Credit Card",
          "orderValue": 390,
          "orderCosts": 352.45,
          "recipient": {
            "name": "Maxwell van Veen",
            "phones": ["+27 825804888", "+27 748911187"],
            "company": "Wireline Africa PTY LTD",
            "unit": "Pecanwood Golf Estate",
            "address": "12, Lakeview Drive, Pecanwood Estate, Hartbeespoort, North West, 0216",
            "message": "Dear Mrs. Maxwell van Veen,\n\nI would personally like to THANK YOU for allowing my company to use your electricity for the up and coming My Wildlife tour hosted at Bunningwood and for being so understanding and accommodating.\n\nWireless Africa Kly Ltd\n\nMr. Katharina Bijlsma\nCEO",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/3a2c80b2-598c-4a35-baaf-e2638a8e45b7.jpg",
            "name": "Blushing Boo",
            "size": "Small - AS SHOWN",
            "quantity": "x 1",
            "retailPrice": 390,
            "guidelines": "1 x Square Glass Vase 12cm X 12cm\n1 x Additional Delivery Fee\n2 x Alstroemeria [ Pink]\n2 x Roses [ Pink]\n2 x Roses [ Red]\n3 x Penny Gum [ Grey]\n4 x Greenery [ Green]",
            "description": "Please email care@bloomable.co.za quoting your order number if there are any variations of flowers used in this creation. If the customer is informed of any changes you are more likely to receive better reviews. Thank you.",
          }],
        }, {
          "partner": "Crown Auto Parts",
          "clientName": "Jenthe Jeurissen",
          "clientPhones": ["+27 (012) 801 1234", "+27 (012) 801 1234"],
          "accepted": true,
          "delivered": false,
          "deleted": false,
          "id": "212036216156082090195052175072047009077040169169",
          "number": 2547309,
          "createdAt": dateFrom("2022-03-03T10:04:00.000Z"),
          "clientEmail": "JentheJeurissen@dayrep.com",
          "deliverAtDate": new Date(),
          "paymentType": "Corporate Account",
          "orderValue": 1225,
          "orderCosts": 917.45,
          "recipient": {
            "name": "Jacintha Opstal",
            "phones": ["+27 128011234", "+27 128011234"],
            "company": "",
            "unit": "Crown Auto Parts",
            "address": "Crown Auto Parts, Broadway Street, Mamelodi Gardens, Pretoria, Gauteng, 0122",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/29d3de79-a55f-4914-bc16-bb18369954b4.jpg",
            "name": "Multicoloured Coffin Arrangement",
            "size": "Large - AS SHOWN",
            "quantity": "x 1",
            "retailPrice": 1225,
            "guidelines": "1 x Rectangle Tray [ Large]\n1 x Additional Delivery Fee\n2 x Oasis [ Medium]\n3 x Delphiniums [ Blue]\n4 x Limonium [ Lilac]\n4 x Viburnum [ Green]\n4 x Umbellatum Lilies [ Orange]\n4 x Lisianthus [ White]\n4 x Gerberas [ Yellow, Small]\n5 x Alstroemeria [ Yellow]\n6 x Large Gerberas [ Yellow]\n10 x Bracken [ Green]\n10 x Greenery [ Green]\n12 x Roses [ Orange]",
            "description": "Dimensions: 130cm x 60cm",
          }],
        }, {
          "partner": "Crown Auto Parts",
          "clientName": "Jenthe Jeurissen",
          "clientPhones": ["+27 (012) 801 1234", "+27 (012) 801 1234"],
          "accepted": true,
          "delivered": false,
          "deleted": false,
          "id": "178204018230098186147058169215090161246063083121",
          "number": 2547300,
          "createdAt": dateFrom("2022-03-03T10:01:00.000Z"),
          "clientEmail": "JentheJeurissen@dayrep.com",
          "deliverAtDate": new Date(),
          "paymentType": "Corporate Account",
          "orderValue": 1354.81,
          "orderCosts": 1008.32,
          "recipient": {
            "name": "Charèl Braat",
            "phones": ["+27 128011234", "+27 128011234"],
            "company": "",
            "unit": "Crown Auto Parts",
            "address": "Crown Auto Parts, Broadway Street, Mamelodi Gardens, Pretoria, Gauteng, 0122",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/9613454e-68f4-40de-9975-f03810b0b6c1.jpg",
            "name": "Multicoloured Petals AV",
            "size": "Small",
            "quantity": "x 1",
            "retailPrice": 129.81,
            "guidelines": "",
            "description": "",
          }, {
            "image": "https://www.bloomable.co.za/Uploads/Images/29d3de79-a55f-4914-bc16-bb18369954b4.jpg",
            "name": "Multicoloured Coffin Arrangement",
            "size": "Large - AS SHOWN",
            "quantity": "x 1",
            "retailPrice": 1225,
            "guidelines": "1 x Rectangle Tray [ Large]\n1 x Additional Delivery Fee\n2 x Oasis [ Medium]\n3 x Delphiniums [ Blue]\n4 x Limonium [ Lilac]\n4 x Viburnum [ Green]\n4 x Umbellatum Lilies [ Orange]\n4 x Lisianthus [ White]\n4 x Gerberas [ Yellow, Small]\n5 x Alstroemeria [ Yellow]\n6 x Large Gerberas [ Yellow]\n10 x Bracken [ Green]\n10 x Greenery [ Green]\n12 x Roses [ Orange]",
            "description": "Dimensions: 130cm x 60cm",
          }],
        }, {
          "partner": "Crown Auto Parts",
          "clientName": "Jenthe Jeurissen",
          "clientPhones": ["+27 (012) 801 1234", "+27 (012) 801 1234"],
          "accepted": true,
          "delivered": true,
          "deleted": false,
          "id": "120030035131247037118245192147044054135216106030",
          "number": 2547297,
          "createdAt": dateFrom("2022-03-03T09:57:00.000Z"),
          "clientEmail": "JentheJeurissen@dayrep.com",
          "deliverAtDate": new Date(),
          "paymentType": "Corporate Account",
          "orderValue": 1354.81,
          "orderCosts": 1008.32,
          "recipient": {
            "name": "Yahye Mooijman",
            "phones": ["+27 128011234", "+27 128011234"],
            "company": "",
            "unit": "Crown Auto Parts",
            "address": "Crown Auto Parts, Broadway Street, Mamelodi Gardens, Pretoria, Gauteng, 0122",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/29d3de79-a55f-4914-bc16-bb18369954b4.jpg",
            "name": "Multicoloured Coffin Arrangement",
            "size": "Large - AS SHOWN",
            "quantity": "x 1",
            "retailPrice": 1225,
            "guidelines": "1 x Rectangle Tray [ Large]\n1 x Additional Delivery Fee\n2 x Oasis [ Medium]\n3 x Delphiniums [ Blue]\n4 x Limonium [ Lilac]\n4 x Viburnum [ Green]\n4 x Umbellatum Lilies [ Orange]\n4 x Lisianthus [ White]\n4 x Gerberas [ Yellow, Small]\n5 x Alstroemeria [ Yellow]\n6 x Large Gerberas [ Yellow]\n10 x Bracken [ Green]\n10 x Greenery [ Green]\n12 x Roses [ Orange]",
            "description": "Dimensions: 130cm x 60cm",
          }, {
            "image": "https://www.bloomable.co.za/Uploads/Images/9613454e-68f4-40de-9975-f03810b0b6c1.jpg",
            "name": "Multicoloured Petals AV",
            "size": "Small",
            "quantity": "x 1",
            "retailPrice": 129.81,
            "guidelines": "",
            "description": "",
          }],
        }, {
          "partner": "Crown Auto Parts",
          "clientName": "Jenthe Jeurissen",
          "clientPhones": ["+27 (012) 801 1234", "+27 (012) 801 1234"],
          "accepted": true,
          "delivered": true,
          "deleted": false,
          "id": "193171235017243217131173176211037156011121111008",
          "number": 2547288,
          "createdAt": dateFrom("2022-03-03T09:46:00.000Z"),
          "clientEmail": "JentheJeurissen@dayrep.com",
          "deliverAtDate": new Date(),
          "paymentType": "Corporate Account",
          "orderValue": 1354.81,
          "orderCosts": 1008.32,
          "recipient": {
            "name": "Danjella Meesters",
            "phones": ["+27 128011234", "+27 128011234"],
            "company": "Crown Auto Parts",
            "unit": "Crown Auto Parts",
            "address": "Crown Auto Parts, Broadway Street, Mamelodi Gardens, Pretoria, Gauteng, 0122",
          },
          "products": [{
            "image": "https://www.bloomable.co.za/Uploads/Images/29d3de79-a55f-4914-bc16-bb18369954b4.jpg",
            "name": "Multicoloured Coffin Arrangement",
            "size": "Large - AS SHOWN",
            "quantity": "x 1",
            "retailPrice": 1225,
            "guidelines": "1 x Rectangle Tray [ Large]\n1 x Additional Delivery Fee\n2 x Oasis [ Medium]\n3 x Delphiniums [ Blue]\n4 x Limonium [ Lilac]\n4 x Viburnum [ Green]\n4 x Umbellatum Lilies [ Orange]\n4 x Lisianthus [ White]\n4 x Gerberas [ Yellow, Small]\n5 x Alstroemeria [ Yellow]\n6 x Large Gerberas [ Yellow]\n10 x Bracken [ Green]\n10 x Greenery [ Green]\n12 x Roses [ Orange]",
            "description": "Dimensions: 130cm x 60cm",
          }, {
            "image": "https://www.bloomable.co.za/Uploads/Images/9613454e-68f4-40de-9975-f03810b0b6c1.jpg",
            "name": "Multicoloured Petals AV",
            "size": "Small",
            "quantity": "x 1",
            "retailPrice": 129.81,
            "guidelines": "",
            "description": "",
          }],
        }];
      return emptyPromiseWithValue(orders as unknown as Order[]);
    }

    return server.getOrdersPage(page)
      .then((html: string) => {
        return ServerHtml.ordersResponseToOrders(html);
      });
  };

  export const fetchAll = (): Promise<Order[]> => {
    fetchedOrders = [];
    return sequentiallyFetchAll();
  };

  const sequentiallyFetchAll = (page: number = 1): Promise<Order[]> => {
    return fetchPage(page)
      .then((orders: Order[]) => {
        fetchedOrders = fetchedOrders.concat(orders);

        const hasNext = page < config.maxOrderPagesToFetch;
        if (hasNext) {
          return sequentiallyFetchAll(page + 1);
        }

        return fetchedOrders;
      });
  };

  export const fetchDetailsForOrders = (orders: Order[]): Promise<Order[]> => {
    if (orders.length === 0) {
      return emptyPromiseWithValue(orders);
    }

    const nextOrder = orders.find(it => it.recipient === undefined);
    if (nextOrder === undefined) {
      return emptyPromiseWithValue(orders);
    }

    return fetchDetailsForOrder(nextOrder)
      .then((order) => {
        orders = orders.filter(it => it !== nextOrder);
        orders.push(order);
        return fetchDetailsForOrders(orders);
      });
  };

  export const fetchDetailsForOrder = (order: Order): Promise<Order> => {
    if (!order.id) {
      return emptyPromiseWithValue(order);
    }
    if (order.recipient !== undefined) {
      return emptyPromiseWithValue(order);
    }

    if (config.offlineData) {
      const updatedOrder = Order.clone(order);
      updatedOrder.recipient = new Recipient();
      updatedOrder.recipient.name = "recipient name";
      updatedOrder.recipient.address = "the address";
      return emptyPromiseWithValue(updatedOrder);
    }

    return server.getOrderDetailsPage(order.id)
      .then((html: string) => {
        const { recipient, orderValue, products } = ServerHtml.orderDetailsResponseToOrderDetails(html);
        const updatedOrder = Order.clone(order);
        updatedOrder.recipient = recipient;
        updatedOrder.products = products;
        if (updatedOrder.orderValue === undefined) {
          updatedOrder.orderValue = orderValue;
        }
        return updatedOrder;
      });
  };

  export const sort = (orders: Order[]): Order[] =>
    orders
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .sort((a, b) => (b.delivered ? 1 : -1) - (a.delivered ? 1 : -1))
      .sort((a, b) => {
        if (a.deliverAtDate && b.deliverAtDate) {
          return a.deliverAtDate.getTime() - b.deliverAtDate.getTime();
        } else if (a.deliverAtDate) {
          return 1;
        } else if (b.deliverAtDate) {
          return -1;
        } else {
          return (a.number || 0) - (b.number || 0);
        }
      })
      .reverse();
}
