import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { settings } from "../../../logic/settings/settings";
import { lightColors } from "../../theme";
import { componentStyles } from "./PressableComponent";

interface Props {
  settingsKey: string,
  title: string,
  description?: string
}

const SwitchComponent: React.FC<Props> = ({
                                            settingsKey,
                                            title,
                                            description,
                                          }) => {
  const [value, setValue] = useState<boolean>((settings as {[key: string]: any})[settingsKey]);
  useEffect(() => {
    (settings as {[key: string]: any})[settingsKey] = value;
    settings.store();
  }, [value]);

  return <View
    style={[componentStyles.container, switchComponentStyles.container, componentStyles.whiteContainer]}>
    <View style={componentStyles.titleContainer}>
      <Text style={componentStyles.titleText}>{title}</Text>
      {description === undefined ? undefined : <Text style={componentStyles.descriptionText}>{description}</Text>}
    </View>
    <Switch onValueChange={(newValue) => setValue(newValue)}
            thumbColor={switchComponentStyles.switch.color}
            ios_backgroundColor={switchComponentStyles.switch.backgroundColor}
            value={value} />
  </View>;
};

const switchComponentStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switch: {
    color: lightColors.switchComponentThumb,
    backgroundColor: lightColors.switchComponentBackground,
  },
});

export default SwitchComponent;
