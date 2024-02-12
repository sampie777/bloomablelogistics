import React, { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { settings } from "../../../logic/settings/settings";
import { lightColors } from "../../theme";
import { componentStyles } from "./PressableComponent";

interface Props {
  settingsKey: string,
  title: string,
  description?: string,
  callback?: (value: boolean) => void,
}

const SwitchComponent: React.FC<Props> = ({
                                            settingsKey,
                                            title,
                                            description,
                                            callback,
                                          }) => {
  const [value, setValue] = useState<boolean>(settings[settingsKey]);
  useEffect(() => {
    settings[settingsKey] = value;
    settings.store();
    callback?.(value);
  }, [value]);

  return <View
    style={[componentStyles.container, styles.container, componentStyles.whiteContainer]}>
    <View style={componentStyles.titleContainer}>
      <Text style={componentStyles.titleText}>{title}</Text>
      {description === undefined ? undefined : <Text style={componentStyles.descriptionText}>{description}</Text>}
    </View>
    <Switch onValueChange={(newValue) => setValue(newValue)}
            thumbColor={styles.switch.color}
            ios_backgroundColor={styles.switch.backgroundColor}
            value={value} />
  </View>;
};

const styles = StyleSheet.create({
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
