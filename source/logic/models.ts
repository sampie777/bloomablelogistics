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
}

export class Recipient {
  name: string = "";
  phones: string[] = [];
  company: string = "";
  unit: string = "";
  address: string = "";
  message: string | undefined;
  specialInstructions: string | undefined;
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
