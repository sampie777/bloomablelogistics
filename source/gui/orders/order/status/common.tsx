import React from "react";
import { lightColors } from "../../../theme";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BooleanProps {
  positive: boolean,
  positiveText: string,
  negativeText: string
}

export const StatusText: React.FC<BooleanProps> = ({ positive, positiveText, negativeText }) => {
  return <Text
    style={[styles.boolean, (positive ? styles.booleanPositive : styles.booleanNegative)]}>
    {positive ? positiveText : negativeText}
  </Text>;
};

export const StatusButton: React.FC<BooleanProps & { onPress?: () => void }> = ({
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

export const StatusLoading: React.FC<{ text: string }> = ({ text }) => {
  return <View style={[styles.boolean, styles.booleanUnknown]}>
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
  booleanUnknown: {
    backgroundColor: "#6ea4e0",
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
