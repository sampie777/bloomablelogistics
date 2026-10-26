import React, { PropsWithChildren } from "react";
import { Alert, Pressable, StyleProp, View, ViewStyle } from "react-native";
import { openLink } from "../../logic/utils/utils";

interface Props {
  url: string;
  style?: StyleProp<ViewStyle>;
  onOpened?: () => void;
  onLongPress?: () => void;
}

const UrlLink: React.FC<PropsWithChildren<Props>> = ({
  children,
  url,
  style,
  onOpened,
  onLongPress,
}) => {
  const open = () => {
    openLink(url)
      .then(onOpened)
      .catch((error: any) => Alert.alert("Error opening link", error?.message || String(error)));
  };

  return (
    <View style={style}>
      <Pressable onPress={open} onLongPress={onLongPress} style={({ pressed }) => pressed ? { opacity: 0.7 } : undefined}>
        <View>
          {children}
        </View>
      </Pressable>
    </View>
  );
};

export default UrlLink;
