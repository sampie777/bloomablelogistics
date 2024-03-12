import React from "react";
import { Alert, TouchableOpacity, View } from "react-native";
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
        <TouchableOpacity onPress={open} onLongPress={onLongPress}>
          <View>
            {children}
          </View>
        </TouchableOpacity>
      </View>);
  };

export default UrlLink;

