import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native";
import OrderItem from "./order/OrderItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/orders/models";
import ProgressView from "../dashboard/ProgressView";
import { getNextDay, getPreviousDay } from "../../logic/utils/utils";
import { useRecoilState } from "recoil";
import {
  orderActionInProgressState,
  ordersOutdatedState,
  selectedDateState,
} from "../../logic/recoil";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { config } from "../../config";

interface Props {
  orders: Order[];
  showHeader: boolean;
  onScrollViewScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const OrdersList: React.FC<Props> = ({
                                       orders,
                                       showHeader,
                                       onScrollViewScroll,
                                     }) => {
  const _newDateRef = useRef<Date | undefined>(undefined);
  const swipeDirection = useRef<number>(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);
  const [ordersOutdated, setOrdersOutdated] = useRecoilState(ordersOutdatedState);
  const [orderActionInProgress, setOrderActionInProgress] = useRecoilState(orderActionInProgressState);

  const animatedHorizontalOffset = useSharedValue(0);
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: animatedHorizontalOffset.value },
      ],
    };
  });

  useEffect(() => {
    animatedHorizontalOffset.value = swipeDirection.current * -1 * Dimensions.get("window").width;
    animateDayTransition(0);
  }, [orders]);

  const goToPreviousDay = () => {
    const newDate = getPreviousDay(selectedDate);
    animateDayTransition(1, newDate);
  };

  const goToNextDay = () => {
    const newDate = getNextDay(selectedDate);
    animateDayTransition(-1, newDate);
  };

  const animateDayTransition = (direction: number, newDate?: Date, duration = 200) => {
    _newDateRef.current = newDate;
    swipeDirection.current = direction;

    const width = screenWidth || Dimensions.get("window").width;
    animatedHorizontalOffset.value = withTiming(
      direction * width,
      {
        duration: duration,
        easing: direction === 0 ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
      },
      (finished) => {
        "worklet";
        if (finished) {
          runOnJS(updateSelectedDate)();
        }
      }
    );
  };

  const updateSelectedDate = () => {
    if (_newDateRef.current) {
      setSelectedDate(_newDateRef.current);
    }
    _newDateRef.current = undefined;
  };

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-config.ordersListSwipeMinXOffset, config.ordersListSwipeMinXOffset])
    .failOffsetY([-config.ordersListSwipeMaxYOffset, config.ordersListSwipeMaxYOffset])
    .onUpdate((e) => {
      const dx = e.translationX;
      animatedHorizontalOffset.value = dx - (dx > 0 ? 1 : -1) * config.ordersListSwipeMinXOffset / 2;
    })
    .onEnd((e) => {
      const dx = e.translationX;
      const dy = e.translationY;

      if (Math.abs(dx) < config.ordersListSwipeMinXOffset || Math.abs(dy) > config.ordersListSwipeMaxYOffset) {
        animateDayTransition(0, undefined, 400);
        return;
      }

      if (dx < 0) {
        goToNextDay();
      } else {
        goToPreviousDay();
      }
    });

  const renderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return <OrderItem order={item} />;
  };

  const refreshOrders = () => {
    setOrdersOutdated(true);
  };

  return <GestureDetector gesture={swipeGesture}>
    <Animated.View style={[styles.container, animatedContainerStyle]}
                   onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
      <Animated.FlatList data={orders}
                         contentContainerStyle={styles.list}
                         renderItem={renderOrderItem}
                         keyExtractor={order => order.id + ""}
                         onEndReachedThreshold={2}
                         onRefresh={refreshOrders}
                         refreshing={ordersOutdated && orderActionInProgress}
                         ListEmptyComponent={ListEmptyComponent}
                         ListHeaderComponent={showHeader ? ProgressView : undefined}
                         onScroll={onScrollViewScroll}
                         scrollEventThrottle={1}
      />
    </Animated.View>
  </GestureDetector>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 30,
    paddingBottom: 80,
  },
});

export default OrdersList;
