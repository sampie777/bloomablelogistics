import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { lightColors } from "../../theme";

interface Props {
  title: string,
  description?: string
  onPress?: () => void
}

const PressableComponent: React.FC<Props> = ({
                                               title,
                                               description,
                                               onPress,
                                             }) => {
  return <TouchableOpacity onPress={onPress}
                           style={[componentStyles.container, componentStyles.whiteContainer]}>
    <View style={componentStyles.titleContainer}>
      <Text style={componentStyles.titleText}>{title}</Text>
    </View>
    {description === undefined ? undefined : <Text style={componentStyles.descriptionText}>{description}</Text>}
  </TouchableOpacity>;
};

export const componentStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 1,
    backgroundColor: lightColors.background,
  },
  whiteContainer: {
    backgroundColor: lightColors.surface1,
    borderColor: lightColors.border,
    borderBottomWidth: 1,
  },

  titleContainer: {
    flex: 1,
    paddingRight: 5,
  },
  titleText: {
    fontSize: 16,
    color: lightColors.text,
  },
  descriptionText: {
    color: lightColors.textLight,
    fontSize: 14,
    paddingTop: 5,
    fontStyle: "italic",
  },
  valueText: {
    color: lightColors.textLight,
    fontSize: 14,
    paddingTop: 5,
  },
});

export default PressableComponent;
