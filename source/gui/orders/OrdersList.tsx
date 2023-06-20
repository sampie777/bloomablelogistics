import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
} from "react-native";
import OrderItem from "./order/OrderItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/models";
import ProgressView from "../dashboard/ProgressView";
import { getNextDay, getPreviousDay } from "../../logic/utils";
import { useRecoilState } from "recoil";
import { orderActionInProgressState, ordersOutdatedState, selectedDateState } from "../../logic/recoil";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { config } from "../../config";
import { Orders } from "../../logic/orders";
import { rollbar } from "../../logic/rollbar";

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
  let startX = 0, startY = 0;

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

  function applyOrderAction(order: Order, action: (order: Order) => Promise<any>, errorTitle: string, errorMessage: string) {
    setOrderActionInProgress(true);
    action(order)
      .then(() => refreshOrders())
      .catch(e => {
        rollbar.error(errorMessage, { error: e, order: order });
        Alert.alert(errorTitle, `${errorMessage}\n\n${e}.`);
      })
      .finally(() => setOrderActionInProgress(false));
  }

  const promptAcceptOrder = (order: Order) => {
    Alert.alert(
      "Accept order",
      "Do you want to accept this order?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => applyOrderAction(
            order,
            Orders.reject,
            "Accept order",
            "Failed to mark order as rejected.",
          ),
          style: "default",
        },
        {
          text: "Accept",
          onPress: () => applyOrderAction(
            order,
            Orders.accept,
            "Accept order",
            "Failed to mark order as accepted.",
          ),
          style: "default",
        },
      ],
      { cancelable: true },
    );
  };

  const promptDeliveredOrder = (order: Order) => {
    Alert.alert(
      "Deliver order",
      "Are you sure you want to mark this order as delivered?\n\n" +
      `Nr. ${order.number} for ${order.recipient?.name}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deliver",
          onPress: () => applyOrderAction(
            order,
            Orders.deliver,
            "Deliver order",
            "Failed to mark order as delivered.",
          ),
          style: "default",
        },
      ],
      { cancelable: true },
    );
  };

  const renderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return <OrderItem order={item}
                      acceptOrder={promptAcceptOrder}
                      deliveredOrder={promptDeliveredOrder} />;
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
