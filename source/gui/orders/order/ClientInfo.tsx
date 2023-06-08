import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import UrlLink from "../../utils/UrlLink";
import { lightColors } from "../../theme";
import { Order } from "../../../logic/models";
import AdditionalInfo from "./AdditionalInfo";

interface Props {
  order: Order;
}

const ClientInfo: React.FC<Props> = ({ order }) => {
  const [collapsed, setCollapsed] = useState(true);

  return <View style={styles.container}>
    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"user-tie"} solid style={styles.icon} />
        <Text style={styles.name} selectable={true}>{order.clientName}</Text>
        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} style={styles.iconCollapse} />
      </View>
    </TouchableOpacity>

    {collapsed ? undefined : <View>
      {!order.clientEmail ? undefined :
        <View style={styles.row}>
          <FontAwesome5Icon name={"envelope"} style={styles.icon} />
          <UrlLink url={"mailto:" + order.clientEmail}>
            <Text style={styles.email} selectable={true}>{order.clientEmail}</Text>
          </UrlLink>
        </View>
      }

      {order.clientPhones.map((it, i) =>
        <View key={i} style={styles.row}>
          <FontAwesome5Icon name={"phone-alt"} style={styles.icon} />
          <UrlLink url={"tel:" + it}>
            <Text style={styles.phone} selectable={true}>{it}</Text>
          </UrlLink>
        </View>)
      }

      <AdditionalInfo order={order} />
    </View>}
  </View>;
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 3,
  },
  iconCollapse: {
    color: lightColors.text,
  },
  name: {
    paddingVertical: 5,
    flex: 1,
    color: lightColors.text,
  },
  email: {
    color: lightColors.url,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
    color: lightColors.text,
  },
  phone: {
    color: lightColors.url,
  },
});

export default ClientInfo;
