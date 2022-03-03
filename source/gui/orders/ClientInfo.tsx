import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "../../logic/orders";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import UrlLink from "../utils/UrlLink";
import { lightColors } from "../theme";

interface Props {
  order: Order;
}

const ClientInfo: React.FC<Props> = ({ order }) => {
  const [collapsed, setCollapsed] = useState(true);

  return <View style={styles.container}>
    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"user"} solid style={styles.icon} />
        <Text style={styles.name}>{order.clientName}</Text>
        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} />
      </View>
    </TouchableOpacity>

    {collapsed ? undefined : <View>
      <View style={styles.row}>
        <FontAwesome5Icon name={"envelope"} style={styles.icon} />
        <UrlLink url={"mailto:" + order.clientEmail}>
          <Text style={styles.email}>{order.clientEmail}</Text>
        </UrlLink>
      </View>

      {order.clientPhones.map((it, i) =>
        <View key={i} style={styles.row}>
          <FontAwesome5Icon name={"phone-alt"} style={styles.icon} />
          <UrlLink url={"tel:" + it}>
            <Text style={styles.phone}>{it}</Text>
          </UrlLink>
        </View>)
      }
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
  name: {
    paddingVertical: 5,
    flex: 1,
  },
  email: {
    color: lightColors.url,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
  },
  phone: {
    color: lightColors.url,
  },
});

export default ClientInfo;
