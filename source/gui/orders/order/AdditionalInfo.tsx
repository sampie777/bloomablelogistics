import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { format } from "../../../logic/utils";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { Order } from "../../../logic/models";
import { lightColors } from "../../theme";

interface Props {
  order: Order;
}

const AdditionalInfo: React.FC<Props> = ({ order }) => {
  return <View style={styles.container}>
    <View style={styles.row}>
      <FontAwesome5Icon name={"briefcase"} style={[styles.icon, styles.iconPartner]} />
      <Text style={styles.partner}>{order.partner}</Text>
    </View>

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
      <Text style={styles.createdAt}>Created
        on {format(order.createdAt, "%YYYY-%mm-%dd at %HH:%MM") || "unknown"}</Text>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
    color: lightColors.text,
  },
  iconPartner: {
    paddingTop: 10,
  },
  partner: {
    flex: 1,
    color: lightColors.text,
    paddingTop: 10,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ddd",
  },
  paymentType: {
    color: lightColors.text,
  },
  florist: {
    color: lightColors.text,
  },
  createdAt: {
    color: lightColors.text,
  },
});

export default AdditionalInfo;
