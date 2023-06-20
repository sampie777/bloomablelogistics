import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "../../../logic/models";
import { lightColors } from "../../theme";

interface BooleanProps {
  positive: boolean,
  positiveText: string,
  negativeText: string
}

const StatusText: React.FC<BooleanProps> = ({ positive, positiveText, negativeText }) => {
  return <Text
    style={[styles.boolean, (positive ? styles.booleanPositive : styles.booleanNegative)]}>
    {positive ? positiveText : negativeText}
  </Text>;
};

const StatusButton: React.FC<BooleanProps & { onPress?: () => void }> = ({
                                                                           positive,
                                                                           positiveText,
                                                                           negativeText,
                                                                           onPress,
                                                                         }) => {
  return <TouchableOpacity onPress={onPress}
                           style={[styles.boolean, (positive ? styles.booleanPositive : styles.booleanNegative), styles.button]}>
    <Text style={[styles.booleanText]}>
      {positive ? positiveText : negativeText}
    </Text>
  </TouchableOpacity>;
};

interface Props {
  order: Order;
  acceptOrder?: (order: Order) => void;
  deliveredOrder?: (order: Order) => void;
}

const OrderStatus: React.FC<Props> = ({
                                        order,
                                        acceptOrder,
                                        deliveredOrder,
                                      }) => {
  return <View style={styles.container}>
    {order.accepted ?
      <StatusText positive={order.accepted}
                  positiveText={"Accepted"}
                  negativeText={"Not accepted"} />
      : <StatusButton positive={order.accepted}
                      positiveText={"Accepted"}
                      negativeText={"Not accepted"}
                      onPress={() => acceptOrder?.(order)} />
    }
    {order.delivered || !order.accepted || order.deleted ?
      <StatusText positive={order.delivered}
                  positiveText={"Delivered"}
                  negativeText={"Not delivered"} />
      : <StatusButton positive={order.delivered}
                      positiveText={"Delivered"}
                      negativeText={"Not delivered"}
                      onPress={() => deliveredOrder?.(order)} />
    }
    {!order.deleted ? undefined : <Text
      style={[styles.boolean, styles.booleanError]}>
      Deleted
    </Text>}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 5,
    alignItems: "center",
  },
  boolean: {
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    color: lightColors.text,
  },
  button: {
    paddingVertical: 7,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  booleanPositive: {
    backgroundColor: "#00c900",
    color: "#fff",
  },
  booleanNegative: {
    backgroundColor: "#ec8700",
    color: "#fff",
  },
  booleanError: {
    backgroundColor: "#ec0000",
    color: "#fff",
  },
  booleanText: {
    color: "#fff",
  },
});

export default OrderStatus;
