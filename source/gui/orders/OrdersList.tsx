import React, { useEffect, useRef, useState } from "react";
import { Dimensions, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native";
import OrderItem from "./order/OrderItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/orders/models";
import ProgressView from "../dashboard/ProgressView";
import { getNextDay, getPreviousDay } from "../../logic/utils";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  orderActionInProgressState,
  ordersOutdatedState,
  selectedDateOrdersState,
  selectedDateState,
} from "../../logic/recoil";
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";
import { config } from "../../config";

interface Props {
  showHeader: boolean;
  onScrollViewScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const OrdersList: React.FC<Props> = ({
                                       showHeader,
                                       onScrollViewScroll,
                                     }) => {
  let startX = 0, startY = 0;

  const orders = useRecoilValue(selectedDateOrdersState);
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

    animatedHorizontalOffset.value = withTiming(direction * screenWidth, {
      duration: duration,
      easing: direction === 0 ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    }, () => runOnJS(updateSelectedDate)());
  };

  const updateSelectedDate = () => {
    if (_newDateRef.current) {
      setSelectedDate(_newDateRef.current);
    }
    _newDateRef.current = undefined;
  };

  const swipeGesture = Gesture.Fling()
    .runOnJS(true)
    .direction(Directions.RIGHT | Directions.LEFT)
    .numberOfPointers(1)
    .onBegin((e) => {
      startX = e.absoluteX;
      startY = e.absoluteY;
    })
    .onTouchesMove((e) => {
      if (e.allTouches.length === 0) {
        return;
      }

      const currentX = e.allTouches[0].absoluteX;
      const dx = currentX - startX;

      if (Math.abs(dx) < config.ordersListSwipeMinXOffset / 2) {
        return;
      }

      animatedHorizontalOffset.value = dx - (dx > 0 ? 1 : -1) * config.ordersListSwipeMinXOffset / 2;
    })
    .onFinalize((e) => {
      const currentX = e.absoluteX;
      const currentY = e.absoluteY;
      const dx = currentX - startX;
      const dy = currentY - startY;

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
