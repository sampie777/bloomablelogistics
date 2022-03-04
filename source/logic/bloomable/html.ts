import { rollbar } from "../rollbar";
import { decode } from "html-entities";
import { Order, Recipient } from "../models";

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
    function cleanUp(_html: string) {
      return _html
        .replace(new RegExp("[\n\r\t]*", "gi"), "")
        .replace(new RegExp(" class=\"tv\"", "gi"), "")
        .replace(new RegExp(" +", "gi"), " ")
        .replace(new RegExp("\s?(<\/?(p|ol|li|h\d)>)\s?", "gi"), "$1")
        .replace(new RegExp(" <sup>\s?", "gi"), "<sup>")
        .replace(new RegExp(" </sup>", "gi"), "</sup>")
        .replace(new RegExp(" +", "gi"), " ");
    }

    const extractTable = (_html: string) => _html
      .match(new RegExp("<table class=\"table table-bordered table-striped table-small\">(.*?)</table>", "i"))?.[1];
    const extractTableBody = (_html: string) => _html
      .match(new RegExp("<tbody>(.*?)</tbody>", "i"))?.[1].trim();

    function rowToOrder(row: string): Order {
      const order = new Order();
      let columns = row.split("</td>").map(it => it.trim());
      columns.pop();

      const id = columns[0].match(new RegExp("orderId=(.*?)'"))?.[1];
      const number = columns[0].match(new RegExp(">(\\d+)</a>$"))?.[1];
      const createdAt = columns[1]
        .replace(new RegExp(" *<br ?/> *", "gi"), " ")
        .match(new RegExp(">(.*?)$"))?.[1]
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
        .match(new RegExp(">(.*?)$"))?.[1];
      const paymentType = columns[7]
        .replace(new RegExp(" *<br ?/> *", "gi"), " ")
        .replace("<td>", "")
        .trim();
      const florist = columns[8]
        .replace(new RegExp(" *<br ?/> *", "gi"), " ")
        .replace("<td>", "")
        .trim();
      const orderValue = columns[9]
        .replace(new RegExp(".*> R"), "")
        .replace(",", "")
        .trim();
      const orderCosts = columns[10]
        .replace(new RegExp(".*> R"), "")
        .replace(",", "")
        .trim();
      const accepted = columns[11].match(new RegExp(">(.{0,2})</span>$"))?.[1].toUpperCase() === "Y";
      const delivered = columns[12].match(new RegExp(">(.{0,2})</span>$"))?.[1].toUpperCase() === "Y";
      const deleted = row.match(new RegExp("<tr class=\"deletedOrder\">")) != null;

      order.id = id;
      order.number = number === undefined ? undefined : +number;
      order.createdAt = createdAt === undefined ? undefined : new Date(createdAt + ":00");
      order.partner = decode(partner, { level: "html5" });
      order.clientName = decode(clientName, { level: "html5" });
      order.clientEmail = !email ? email : decode(email, { level: "html5" });
      order.clientPhones = phones.map(it => decode(it, { level: "html5" }));
      order.paymentType = !paymentType ? paymentType : decode(paymentType, { level: "html5" });
      order.florist = !florist ? florist : decode(florist, { level: "html5" });
      order.deliverAtDate = deliverAtDate === undefined ? undefined : new Date(deliverAtDate);
      order.orderValue = orderValue === undefined ? 0 : +orderValue;
      order.orderCosts = orderCosts === undefined ? 0 : +orderCosts;
      order.accepted = accepted;
      order.delivered = delivered;
      order.deleted = deleted;

      return order;
    }

    html = cleanUp(html);

    const table = extractTable(html);
    if (!table) {
      rollbar.error("Could not find table in html");
      return [];
    }

    const body = extractTableBody(table);
    if (!body) {
      rollbar.error("Could not find body in html");
      return [];
    }

    let rows = body.split("</tr>");
    rows.pop(); // Remove last empty element

    return rows.map(it => rowToOrder(it));
  };

  export const orderDetailsResponseToRecipient = (html: string): Recipient | undefined => {
    function cleanUp(_html: string) {
      return _html
        .replace(new RegExp("[\n\r\t]*", "gi"), "")
        .replace(new RegExp(" class=\"tv\"", "gi"), "")
        .replace(new RegExp(" +", "gi"), " ")
        .replace(new RegExp("\s?(<\/?(p|ol|li|h\d)>)\s?", "gi"), "$1")
        .replace(new RegExp(" <sup>\s?", "gi"), "<sup>")
        .replace(new RegExp(" </sup>", "gi"), "</sup>")
        .replace(new RegExp(" +", "gi"), " ");
    }

    const extractTable = (_html: string) => _html
      .match(new RegExp("<table style=\"width: 100%;\"> (<tr> <td colspan=\"4\".*?)</table>", "i"))?.[1];

    html = cleanUp(html);

    const table = extractTable(html);
    if (!table) {
      rollbar.error("Could not find table in html");
      return undefined;
    }

    let rows = table.split("</tr>");
    rows.pop(); // Remove last empty element

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

    const company = columns[i++][1].
    replace(new RegExp(".*\"> "), "")
      .replace(new RegExp("<small.*"), "")
      .trim();
    const unit = columns[i++][1].
    replace(new RegExp(".*\"> "), "")
      .replace(new RegExp("<small.*"), "")
      .trim();
    const address = columns[i++][1]
      .replace(new RegExp(".*\">"), "")
      .replace(new RegExp("<small.*"), "")
      .trim();

    let specialInstructions;
    for (let j = i; j < rows.length - 1; j++) {
      if (rows[j].includes("> Special Instructions </td>")) {
        specialInstructions = rows[j + 2]
          .match(new RegExp("\">(.*?)</td>"))?.[1]
          .replace(new RegExp("<br ?/>", "gi"), "\n")
          .trim();
        break;
      }
    }

    let message;
    for (let j = i; j < rows.length - 1; j++) {
      if (rows[j].includes("> Accompanying Message </td>")) {
        message = rows[j + 2]
          .match(new RegExp("\">(.*?)</td>"))?.[1]
          .replace(new RegExp("<br ?/>", "gi"), "\n")
          .trim();
        break;
      }
    }

    const recipient = new Recipient();
    recipient.name = decode(name, { level: "html5" });
    recipient.phones = phones.filter(it => it).map(it => decode(it, { level: "html5" }));
    recipient.company = decode(company, { level: "html5" });
    recipient.unit = decode(unit, { level: "html5" });
    recipient.address = decode(address, { level: "html5" });
    recipient.message = !message ? message : decode(message, { level: "html5" });
    recipient.specialInstructions = !specialInstructions ? specialInstructions : decode(specialInstructions, { level: "html5" });
    return recipient;
  };
}
