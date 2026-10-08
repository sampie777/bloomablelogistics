import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { lightColors } from "../../../theme";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const CustomRejectReasonInput: React.FC<Props> = ({ value, onChange }) => {
  return <View style={styles.container}>
    <TextInput style={styles.input}
               value={value}
               onChangeText={onChange}
               autoFocus={true}
               multiline={true}
               numberOfLines={3}
               autoCapitalize={"sentences"}
               placeholder={"Insert reason..."} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: lightColors.surface1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    textAlignVertical: "top",
    color: lightColors.text,
  },
});

export default CustomRejectReasonInput;
