import React from "react";
import { lightColors } from "../../../theme";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { OrderStatus } from "../../../../logic/orders/models";
import { Status } from "../../../../logic/orders/status";

interface StatusProps {
  status: OrderStatus;
  onPress?: () => void;
}

const getStyleForStatus = (status: OrderStatus) => {
  switch (status) {
    case "open":
      return styles.statusOpen;
    case "cancelled":
    case "cancel-confirmed":
      return styles.statusCancelled;
    case "accepted":
      return styles.statusAccepted;
    case "fulfilled":
      return styles.statusFulfilled;
    case "delivered":
      return styles.statusDelivered;
  }
};


export const StatusButton: React.FC<StatusProps> = ({ status, onPress }) => {
  return <TouchableOpacity onPress={onPress}
                           disabled={onPress === undefined}
                           style={[styles.boolean, (onPress === undefined ? {} : styles.button), getStyleForStatus(status)]}>
    <Text style={[styles.booleanText]}>
      {Status.toReadableActionText(status)}
    </Text>
  </TouchableOpacity>;
};

export const StatusLoading: React.FC<{ text: string }> = ({ text }) => {
  return <View style={[styles.boolean, styles.loading]}>
    <ActivityIndicator style={styles.icon}
                       size={styles.icon.fontSize}
                       color={styles.icon.color} />
    <Text style={[styles.booleanText]}>
      {text}
    </Text>
  </View>;
};

export const styles = StyleSheet.create({
  boolean: {
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    color: lightColors.text,
    flexDirection: "row",
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
  statusOpen: {
    backgroundColor: "#ec8700",
    color: "#fff",
  },
  statusAccepted: {
    backgroundColor: "#6ea4e0",
    color: "#fff",
  },
  statusFulfilled: {
    backgroundColor: "#12d57f",
    color: "#fff",
  },
  statusDelivered: {
    backgroundColor: "#00c900",
    color: "#fff",
  },
  statusCancelled: {
    backgroundColor: "#ec0000",
    color: "#fff",
  },
  loading: {
    backgroundColor: "#869bb2",
    color: "#fff",
  },
  booleanText: {
    color: "#fff",
  },

  icon: {
    fontSize: 16,
    color: "#fff",
    marginLeft: 0,
    marginRight: 7,
  },
});
