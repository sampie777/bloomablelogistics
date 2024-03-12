import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import OrdersList from "../orders/OrdersList";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { lightColors } from "../theme";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { ParamList, Routes } from "../../routes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const Dashboard: React.FC<NativeStackScreenProps<ParamList>> = ({ navigation }) => {
  const orders = useRecoilValue(selectedDateOrdersState);
  const animatedVerticalOffset = useSharedValue(0);
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      top: styles.settingsButton.top - animatedVerticalOffset.value / 2,
      transform: [
        {
          scale: interpolate(animatedVerticalOffset.value, [0, 150], [1, 0], {
            extrapolateRight: Extrapolation.CLAMP,
          }),
        },
      ],
      opacity: interpolate(animatedVerticalOffset.value, [0, 70], [1, 0], {
        extrapolateRight: Extrapolation.CLAMP,
      }),
    };
  });

  const openSettings = () => {
    navigation.navigate(Routes.Settings);
  };

  const onScrollViewScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      animatedVerticalOffset.value = e.contentOffset.y;
    },
  });

  const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

  return <View style={styles.container}>
    <AnimatedTouchableOpacity style={[styles.settingsButton, animatedContainerStyle]}
                              onPress={openSettings}>
      <FontAwesome5Icon name={"cog"} style={styles.settingsButtonIcon} />
    </AnimatedTouchableOpacity>

    <OrdersList orders={orders}
                showHeader={true}
                onScrollViewScroll={onScrollViewScroll} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  settingsButton: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: lightColors.button,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    top: 15,
    left: 15,
    overflow: "hidden",
    zIndex: 1000,
  },
  settingsButtonIcon: {
    color: lightColors.textLighter,
    fontSize: 22,
  },
});

export default Dashboard;
