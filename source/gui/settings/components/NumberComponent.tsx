import React, { useEffect, useState } from "react";
import { settings } from "../../../logic/settings/settings";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { componentStyles } from "./PressableComponent";
import { lightColors } from "../../theme";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  settingsKey: string,
  title: string,
  description?: string,
  callback?: (value: number) => void,
  valueRender?: (value: number) => string,
}

const NumberComponent: React.FC<Props> = ({
                                            settingsKey,
                                            title,
                                            description,
                                            callback,
                                            valueRender,
                                          }) => {
  const [value, setValue] = useState<number>(settings[settingsKey]);

  useEffect(() => {
    settings[settingsKey] = value;
    settings.store();
    callback?.(value);
  }, [value]);

  const increase = () => setValue(it => it + 1);
  const decrease = () => setValue(it => Math.max(it - 1, 1));

  if (valueRender === undefined) {
    valueRender = it => it.toString();
  }

  return <View
    style={[componentStyles.container, styles.container, componentStyles.whiteContainer]}>
    <View style={[componentStyles.titleContainer, styles.titleContainer]}>
      <Text style={componentStyles.titleText}>{title}</Text>
      {description === undefined ? undefined : <Text style={componentStyles.descriptionText}>{description}</Text>}
    </View>

    <View style={styles.valueContainer}>
      <TouchableOpacity onPress={decrease}
                        style={styles.button}>
        <FontAwesome5Icon name={"minus"} solid style={styles.icon} />
      </TouchableOpacity>

      <Text style={styles.valueText}>{valueRender(value)}</Text>

      <TouchableOpacity onPress={increase}
                        style={styles.button}>
        <FontAwesome5Icon name={"plus"} solid style={styles.icon} />
      </TouchableOpacity>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleContainer: {
    flex: 1,
  },

  valueContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  valueText: {
    color: lightColors.text,
    paddingHorizontal: 10,
    fontSize: 18,
  },
  button: {
    backgroundColor: lightColors.button,
    width: 40,
    height: 40,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  icon: {
    color: lightColors.text,
    fontSize: 20,
  },
});

export default NumberComponent;
