import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CheckBox from "@react-native-community/checkbox";
import { lightColors } from "../../../theme";

interface Props {
  text: string,
  isSelected: boolean;
  onSelect: (reason: string) => void;
}

const RejectReasonComponent: React.FC<Props> = ({ text, isSelected, onSelect }) => {
  return <TouchableOpacity style={[styles.container, (isSelected ? styles.containerSelected : {})]}
                           onPress={() => onSelect(text)}>
    <CheckBox style={styles.checkbox} value={isSelected} onChange={() => onSelect(text)} />
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
    paddingVertical: 10,
    borderRadius: 10,
  },
  containerSelected: {
    backgroundColor: lightColors.surface1,
  },
  checkbox: {},
  text: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: lightColors.text,
  },
});

export default RejectReasonComponent;
