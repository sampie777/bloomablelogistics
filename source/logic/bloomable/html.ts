import { rollbar } from "../rollbar";
import { decode } from "html-entities";
import { Order, Product, Recipient } from "../models";
import { HtmlUtils } from "./htmlUtils";

export namespace ServerHtml {
  export const loginResponseToError = (html: string): string => {
    /* Example output:

    <script type="text/javascript">
      BindAjaxLoader(); HideLoading;
    </script>
    <script type="text/javascript">
      HideLoading();
    </script>
    <div id="feedback_9589" class="row">
    <div class="col-md-12 general-alert short-alert">
    <div class="alert alert-danger "><button type="button" class="close" data-dismiss="alert">×</button>Login failed. Please check your username and password and try again.</div>
    </div>
    </div>
    */

    const match = html.match(new RegExp("</button>(.*?)</div>", "i"));
    if (!match) {
      return "";
    }
    return match[1];
  };

  export const ordersResponseToOrders = (html: string): Order[] => {
    const extractTable = (_html: string) => _html
      .match(new RegExp("<table class=\"table table-bordered table-striped table-small orders-dashboard\">(.*?)</table>", "i"))?.[1];
    const extractTableBody = (_html: string) => _html
      .match(new RegExp("<tbody>(.*?)</tbody>", "i"))?.[1].trim();

    html = HtmlUtils.cleanUp(html);

    const table = extractTable(html);
    if (!table) {
      rollbar.error("Could not find order list table in html");
      return [];
    }

    const body = extractTableBody(table);
    if (!body) {
      rollbar.error("Could not find order list table body in html");
      return [];
    }

    let rows = body.split("</tr>");
    rows.pop(); // Remove last empty element

    return rows.map(it => rowToOrder(it));
  };

  export const rowToOrder = (row: string): Order => {
    const order = new Order();
    let columns = row.split("</td>").map(it => it.trim());
    columns.pop();

    const id = columns[0].match(new RegExp("orderId=(.*?)'"))?.[1];
    const number = columns[0].match(new RegExp(">(\\d+)</a>"))?.[1];
    const createdAt = columns[1]
      .replace(new RegExp(" *<br ?/> *", "gi"), " ")
      .match(new RegExp(">(.*?)$"))?.[1]
      .trim()
      .replace(" ", "T");
    const partner = columns[2]
      .replace(new RegExp(" *<br ?/> *", "gi"), " ")
      .replace("<td>", "")
      .trim();
    const clientName = columns[4]
      .replace(new RegExp(" *<br ?/> *", "gi"), " ")
      .replace("<td>", "")
      .trim();
    const email = columns[5].match(new RegExp("mailto:(.*?)\"", "i"))?.[1].trim();
    const phones = columns[5]
      .replace(new RegExp(".*</a>"), "")
      .trim()
      .split("<br />")
      .map(it => it.trim())
      .filter(it => it);
    const deliverAtDate = columns[6]
      .replace(new RegExp(" *<br ?/> *", "gi"), " ")
      .match(new RegExp(">(.*?)$"))?.[1]
      .trim();
    const paymentType = columns[7]
      .replace(new RegExp(" *<br ?/> *", "gi"), " ")
      .replace("<td>", "")
      .trim();
    // const florist = columns[8]
    //   .replace(new RegExp(" *<br ?/> *", "gi"), " ")
    //   .replace("<td>", "")
    //   .trim();
    // const orderValue = columns[9]
    //   .replace(new RegExp(".*> R"), "")
    //   .replace(",", "")
    //   .trim();
    const orderCosts = columns[8]
      .replace(new RegExp(".*> ?R"), "")
      .replace(",", "")
      .trim();
    const accepted = columns[9].match(new RegExp(">(.{0,2})</span>$"))?.[1].toUpperCase() === "Y";
    const delivered = columns[10].match(new RegExp(">(.{0,2})</span>$"))?.[1].toUpperCase() === "Y";
    const deleted = row.match(new RegExp("<tr class=\"deletedOrder\">")) != null;

    order.id = id;
    order.number = number === undefined ? undefined : +number;
    order.createdAt = createdAt === undefined ? undefined : new Date(createdAt + ":00");
    order.partner = decode(partner, { level: "html5" });
    order.clientName = decode(clientName, { level: "html5" });
    order.clientEmail = !email ? email : decode(email, { level: "html5" });
    order.clientPhones = phones.map(it => decode(it, { level: "html5" }));
    order.paymentType = !paymentType ? paymentType : decode(paymentType, { level: "html5" });
    // order.florist = !florist ? florist : decode(florist, { level: "html5" });
    order.deliverAtDate = deliverAtDate === undefined ? undefined : new Date(deliverAtDate);
    // order.orderValue = orderValue === undefined ? undefined : +orderValue;
    order.orderCosts = orderCosts === undefined || orderCosts.includes("TBD") ? undefined : +orderCosts;
    order.accepted = accepted;
    order.delivered = delivered;
    order.deleted = deleted;

    return order;
  };

  interface OrderDetails {
    recipient?: Recipient;
    orderValue?: number;
    products?: Product[];
  }

  export const orderDetailsResponseToOrderDetails = (html: string): OrderDetails => {
    const extractTable = (_html: string) => _html
      .match(new RegExp("<table style=\"width: 100%;\"> (<tr> <td colspan=\"4\".*?)</table> *</table>", "i"))?.[1];

    html = HtmlUtils.cleanUp(html);

    const table = extractTable(html);
    if (!table) {
      rollbar.error("Could not find order details table in html");
      return {};
    }

    let rows = table.split("</tr>");
    rows.pop(); // Remove last empty element

    return {
      recipient: orderDetailsResponseToRecipient(rows),
      orderValue: getOrderValueFromDetails(rows),
      products: orderDetailsResponseToProducts(html),
    };
  };

  export const orderDetailsResponseToRecipient = (rows: string[]): Recipient => {
    let columns = rows.map(it => it.split("</td>"))
      .filter(it => it.length >= 3);

    const name = columns[0][1]
      .replace(new RegExp(".*\"> "), "")
      .replace(new RegExp("<small.*"), "")
      .trim();

    const phones = [];
    let i = 0;
    while (++i < 3) {
      if (!columns[i][0].includes("Telephone")) {
        break;
      }
      phones.push(columns[i][1]
        .replace(new RegExp(".*\"> "), "")
        .replace(new RegExp("<small.*"), "")
        .trim());
    }

    const company = columns[i++][1]
      .replace(new RegExp(".*\"> "), "")
      .replace(new RegExp("<small.*"), "")
      .trim();
    const unit = columns[i++][1]
      .replace(new RegExp(".*\"> "), "")
      .replace(new RegExp("<small.*"), "")
      .trim();
    const address = columns[i++][1]
      .replace(new RegExp(".*\">"), "")
      .replace(new RegExp("<small.*"), "")
      .trim();

    const specialInstructions = HtmlUtils.executeWithRowIndexMatching(rows, "> Special Instructions </td>",
      (index) => rows[index + 2]
        .match(new RegExp("\">(.*?)</td>"))?.[1]
        .replace(new RegExp("<br ?/>", "gi"), "\n")
        .trim(), rows.length - 2);

    const message = HtmlUtils.executeWithRowIndexMatching(rows, "> Accompanying Message </td>",
      (index) => rows[index + 2]
        .match(new RegExp("\">(.*?)</td>"))?.[1]
        .replace(new RegExp("<br ?/>", "gi"), "\n")
        .trim(), rows.length - 2);

    const recipient = new Recipient();
    recipient.name = decode(name, { level: "html5" });
    recipient.phones = phones.filter(it => it).map(it => decode(it, { level: "html5" }));
    recipient.company = decode(company, { level: "html5" });
    recipient.unit = decode(unit, { level: "html5" });
    recipient.address = decode(address, { level: "html5" });
    recipient.specialInstructions = !specialInstructions ? specialInstructions : decode(specialInstructions, { level: "html5" });
    recipient.message = !message ? message : decode(message, { level: "html5" });

    return recipient;
  };

  export const getOrderValueFromDetails = (rows: string[]) => {
    const retailValue = HtmlUtils.executeWithRowIndexMatching(rows, "Please produce a product to the retail value of (excluding delivery):",
      (index) => rows[index]
        .match(new RegExp("\"> *R *([\\d.,]+) *</td>"))?.[1]
        .replace(",", "")
        .trim());

    const deliveryCosts = HtmlUtils.executeWithRowIndexMatching(rows, "Please produce a product to the retail value of (excluding delivery):",
      (index) => rows[index]
        .match(new RegExp("\"> *R *([\\d.,]+) *</td>"))?.[1]
        .replace(",", "")
        .trim());

    let orderValue = 0;
    if (retailValue === undefined && deliveryCosts === undefined) {
      return undefined;
    } else if (retailValue !== undefined) {
      orderValue += +retailValue;
    } else if (deliveryCosts !== undefined) {
      orderValue += +deliveryCosts;
    }
    return orderValue;
  };

  export const orderDetailsResponseToProducts = (html: string): Product[] => {
    const extractTable = (_html: string) => _html
      .match(new RegExp("<td colspan=\"4\"> *<table style=\"width: 100%\">(.*?)</table> *</td> *</tr> *<tr> *<td colspan=\"4\"", "i"))?.[1];

    const table = extractTable(html);
    if (!table) {
      rollbar.error("Could not find products table in html");
      return [];
    }

    const productSections = table.split("</table>")
      .map(it => it.trim())
      .filter(it => it.length > 12);

    return productSections.map(it => getProductFromRow(it));
  };

  export const getProductFromRow = (row: string): Product => {
    const image = row.match(new RegExp("src=\"(.*?)\""))?.[1];
    let rows = row.split("</tr>")
      .map(it => it.trim());
    rows.pop();

    const name = HtmlUtils.executeWithRowIndexMatching(rows, ">Product:</td>",
      (index) => rows[index]
        .match(new RegExp("\">([^<>]*?)</td>$"))?.[1]
        .replace(new RegExp(" *<br ?/> *", "gi"), " ")
        .trim());
    const size = HtmlUtils.executeWithRowIndexMatching(rows, ">Size:</td>",
      (index) => rows[index]
        .match(new RegExp("\">([^<>]*?)</td>$"))?.[1]
        .replace(new RegExp(" *<br ?/> *", "gi"), " ")
        .trim());
    const quantity = HtmlUtils.executeWithRowIndexMatching(rows, ">Qty:</td>",
      (index) => rows[index]
        .match(new RegExp("\">([^<>]*?)</td>$"))?.[1]
        .replace(new RegExp(" *<br ?/> *", "gi"), " ")
        .trim());
    const retailPrice = HtmlUtils.executeWithRowIndexMatching(rows, ">Retail Price:</td>",
      (index) => rows[index]
        .match(new RegExp("\"> *R *([\\d.,]+) *</td>$"))?.[1]
        .replace(",", "")
        .trim());

    const guidelines = HtmlUtils.executeWithRowIndexMatching(rows, ">Guidelines required for this item:</span>",
      (index) => rows[index]
        .match(new RegExp("Guidelines required for this item:</span>(.*?)(<strong>|</td>)"))?.[1]
        .replace(new RegExp(" *<br ?/> *", "gi"), "\n")
        .trim());

    const description = HtmlUtils.executeWithRowIndexMatching(rows, ">Description and special instructions:</strong>",
      (index) => rows[index]
        .match(new RegExp("Description and special instructions:</strong>(.*?)</td>"))?.[1]
        .replace(new RegExp(" *<br ?/> *", "gi"), "\n")
        .trim());

    const product = new Product();
    product.image = image;
    product.name = decode(name, { level: "html5" });
    product.size = decode(size, { level: "html5" });
    product.quantity = decode(quantity, { level: "html5" });
    product.retailPrice = retailPrice === undefined ? retailPrice : +retailPrice;
    product.guidelines = decode(guidelines, { level: "html5" });
    product.description = decode(description, { level: "html5" });
    return product;
  };
}
