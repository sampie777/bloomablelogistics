import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "../../logic/orders";
import { format } from "../../logic/utils";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  order: Order;
}

const AdditionalInfo: React.FC<Props> = ({ order }) => {
  const [collapsed, setCollapsed] = useState(true);
  return <View style={styles.container}>
    <TouchableOpacity onPress={() => setCollapsed(!collapsed)}>
      <View style={styles.row}>
        <FontAwesome5Icon name={"user-tie"} style={styles.icon} />
        <Text style={styles.partner}>{order.partner}</Text>
        <FontAwesome5Icon name={collapsed ? "chevron-down" : "chevron-up"} />
      </View>

      {collapsed ? undefined : <View>
        {!order.paymentType ? undefined :
          <View style={styles.row}>
            <FontAwesome5Icon name={"credit-card"} style={styles.icon} />
            <Text style={styles.paymentType}>{order.paymentType}</Text>
          </View>
        }
        {!order.florist ? undefined :
          <View style={styles.row}>
            <FontAwesome5Icon name={"user-tag"} style={styles.icon} />
            <Text style={styles.florist}>{order.florist}</Text>
          </View>
        }
        <View style={styles.row}>
          <FontAwesome5Icon name={"calendar-plus"} style={styles.icon} />
          <Text style={styles.createdAt}>Created on {format(order.createdAt, "%YYYY-%mm-%dd at %HH:%MM") || "unknown"}</Text>
        </View>
      </View>}
    </TouchableOpacity>
  </View>;
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
  },
  partner: {
    paddingVertical: 5,
    flex: 1,
  },
  paymentType: {},
  florist: {},
  createdAt: {},
});

export default AdditionalInfo;
