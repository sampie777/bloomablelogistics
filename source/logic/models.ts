import { LatLng } from "react-native-maps";

export class Order {
  id: string | undefined;
  number: number | undefined;
  createdAt: Date | undefined;
  partner: string = "";
  clientName: string = "";
  clientEmail: string | undefined;
  clientPhones: string[] = [];
  deliverAtDate: Date | undefined;
  paymentType: string | undefined;
  florist: string | undefined;
  orderValue: number | undefined;
  orderCosts: number | undefined;
  accepted: boolean = false;
  delivered: boolean = false;
  deleted: boolean = false;
  recipient: Recipient | null | undefined;  // null when recipient not available, undefined when recipient not yet fetched
  products: Product[] | undefined;

  static clone(order: Order): Order {
    const newOrder = new Order();
    newOrder.id = order.id;
    newOrder.number = order.number;
    newOrder.createdAt = order.createdAt;
    newOrder.partner = order.partner;
    newOrder.clientName = order.clientName;
    newOrder.clientEmail = order.clientEmail;
    newOrder.clientPhones = order.clientPhones;
    newOrder.deliverAtDate = order.deliverAtDate;
    newOrder.paymentType = order.paymentType;
    newOrder.florist = order.florist;
    newOrder.orderValue = order.orderValue;
    newOrder.orderCosts = order.orderCosts;
    newOrder.accepted = order.accepted;
    newOrder.delivered = order.delivered;
    newOrder.deleted = order.deleted;
    newOrder.recipient = order.recipient;
    newOrder.products = order.products;
    return newOrder;
  }
}

export class Recipient {
  name: string = "";
  phones: string[] = [];
  company: string = "";
  unit: string = "";
  address: string = "";
  message: string | undefined;
  specialInstructions: string | undefined;
  location: LatLng | undefined;
}

export class Product {
  name: string | undefined;
  size: string | undefined;
  quantity: string | undefined;
  retailPrice: number | undefined;
  guidelines: string | undefined;
  description: string | undefined;
  image: string | undefined;
}
