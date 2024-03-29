export type OrderStatus = "open" | "rejected" | "cancelled" | "cancel-confirmed" | "accepted" | "fulfilled" | "delivered";

export class Order {
  id?: string = undefined;
  number?: number = undefined;
  createdAt?: Date = undefined;
  deliverAtDate?: Date = undefined;
  orderValue?: number = undefined;
  orderCosts?: number = undefined;
  status: OrderStatus = "open";
  recipient: Recipient = new Recipient();
  products: Product[] = [];

  // Local state of the order whether it is currently being processed.
  isProcessing: boolean = false;

  static clone(from: Order): Order {
    const to = new Order();
    to.id = from.id;
    to.number = from.number;
    to.createdAt = from.createdAt;
    to.deliverAtDate = from.deliverAtDate;
    to.orderValue = from.orderValue;
    to.orderCosts = from.orderCosts;
    to.status = from.status;
    to.recipient = from.recipient ? Recipient.clone(from.recipient) : from.recipient;
    to.products = from.products.map(it => Product.clone(it));

    to.isProcessing = from.isProcessing ?? false;
    return to;
  }
}

export class Recipient {
  name: string = "";
  phones: string[] = [];
  company: string = "";
  unit: string = "";
  address: string = "";
  coordinates?: {
    latitude: number,
    longitude: number,
  } = undefined;
  message?: string = undefined;
  specialInstructions?: string = undefined;

  static clone(from: Recipient): Recipient {
    const to = new Recipient();
    to.name = from.name;
    to.phones = from.phones;
    to.company = from.company;
    to.unit = from.unit;
    to.address = from.address;
    to.message = from.message;
    to.specialInstructions = from.specialInstructions;
    return to;
  }
}

export class ProductExtra {
  name?: string = undefined;
  description?: string = undefined;
  image?: string = undefined;

  static clone(from: ProductExtra): ProductExtra {
    const to = new ProductExtra();
    to.name = from.name;
    to.description = from.description;
    to.image = from.image;
    return to;
  }
}

export class Product {
  id: number = -1;
  name?: string = undefined;
  size?: string = undefined;
  quantity?: number = undefined;
  retailPrice?: number = undefined;
  guidelines?: string = undefined;
  description?: string = undefined;
  image?: string = undefined;
  extras?: ProductExtra[] = undefined;

  _detailsLoaded: boolean = false;

  static clone(from: Product): Product {
    const to = new Product();
    to.id = from.id;
    to.name = from.name;
    to.size = from.size;
    to.quantity = from.quantity;
    to.retailPrice = from.retailPrice;
    to.guidelines = from.guidelines;
    to.description = from.description;
    to.image = from.image;
    to.extras = from.extras?.map(it => ProductExtra.clone(it));

    to._detailsLoaded = from._detailsLoaded;
    return to;
  }
}
