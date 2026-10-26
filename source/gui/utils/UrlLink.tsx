import React from "react";
import { Alert, Pressable, View } from "react-native";
import { openLink } from "../../logic/utils/utils";

const UrlLink: React.FC<{
  url: string,
  style?: Array<Object> | Object,
  onOpened?: () => void,
  onLongPress?: () => void,
}> =
  ({
     children,
     url,
     style = [],
     onOpened,
     onLongPress,
   }) => {
    const open = () => {
      openLink(url)
        .then(onOpened)
        .catch(error => Alert.alert("Error opening link", error.message));
    };

    return (
      <View style={style}>
        <Pressable onPress={open} onLongPress={onLongPress} style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}>
          <View>
            {children}
          </View>
        </Pressable>
      </View>);
  };

export default UrlLink;
