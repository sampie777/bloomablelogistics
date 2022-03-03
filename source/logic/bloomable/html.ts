import { Order } from "../orders";
import { rollbar } from "../rollbar";

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
        .replace(new RegExp("<br ?/>", "gi"), " ")
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

      const number = columns[0].match(new RegExp(">(\\d+)</a>$"))?.[1];
      const createdAt = columns[1].match(new RegExp(">(.*?)$"))?.[1].replace(" ", "T");
      const partner = columns[2].replace("<td>", "").trim();
      const clientName = columns[4].replace("<td>", "").trim();
      const email = columns[5].match(new RegExp("mailto:(.*?)\"", "i"))?.[1].trim();
      const phones = columns[5].replace(new RegExp(".*</a>"), "").trim().split(" ");
      const deliverAt = columns[6].match(new RegExp(">(.*?)$"))?.[1]
      const paymentType = columns[7].replace("<td>", "").trim();
      const florist = columns[8].replace("<td>", "").trim();
      const orderValue = columns[9].replace(new RegExp(".*> R"), "").trim().replace(",", "");
      const orderCosts = columns[10].replace(new RegExp(".*> R"), "").trim().replace(",", "");
      const accepted = columns[11].match(new RegExp(">(.{0,2})</span>$"))?.[1].toUpperCase() === "Y";
      const delivered = columns[12].match(new RegExp(">(.{0,2})</span>$"))?.[1].toUpperCase() === "Y";

      order.number = number === undefined ? undefined : +number;
      order.createdAt = createdAt === undefined ? undefined : new Date(createdAt + ":00");
      order.partner = partner;
      order.clientName = clientName;
      order.clientEmail = email;
      order.clientPhones = phones;
      order.paymentType = paymentType;
      order.florist = florist;
      order.deliverAt = deliverAt === undefined ? undefined : new Date(deliverAt);
      order.orderValue = orderValue === undefined ? 0 : +orderValue;
      order.orderCosts = orderCosts === undefined ? 0 : +orderCosts;
      order.accepted = accepted;
      order.delivered = delivered;

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
}
