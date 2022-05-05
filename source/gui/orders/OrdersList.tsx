import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, ListRenderItemInfo, StyleSheet } from "react-native";
import OrderItem from "./order/OrderItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/models";
import ProgressView from "../dashboard/ProgressView";
import { getNextDay, getPreviousDay } from "../../logic/utils";
import { useRecoilState } from "recoil";
import { selectedDateState } from "../../logic/recoil";
import Animated, { Easing } from "react-native-reanimated";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { config } from "../../config";

interface Props {
  orders: Order[];
  showHeader: boolean;
}

const OrdersList: React.FC<Props> = ({ orders, showHeader }) => {
  let startX = 0, startY = 0, endX = 0, endY = 0;

  const swipeDirection = useRef<number>(0);
  const [screenWidth, setScreenWidth] = useState(0);
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);

  const animatedHorizontalOffset = new Animated.Value<number>(swipeDirection.current * -1 * Dimensions.get("window").width);
  const animatedStyle = {
    listContainer: {
      transform: [
        { translateX: animatedHorizontalOffset },
      ],
    },
  };

  useEffect(() => {
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
    swipeDirection.current = direction;

    Animated.timing(animatedHorizontalOffset, {
      toValue: direction * screenWidth,
      duration: duration,
      easing: direction === 0 ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    }).start(() => {
      if (newDate) {
        setSelectedDate(newDate);
      }
    });
  };

  const swipeGesture = Gesture.Fling()
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

      animatedHorizontalOffset.setValue(dx - (dx > 0 ? 1 : -1) * config.ordersListSwipeMinXOffset / 2);
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

  return <GestureHandlerRootView style={{ flex: 1 }}>
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={[styles.container, animatedStyle.listContainer]}
                     onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
        <FlatList data={orders}
                  contentContainerStyle={styles.list}
                  renderItem={renderOrderItem}
                  keyExtractor={order => order.id + ""}
                  onEndReachedThreshold={2}
                  ListEmptyComponent={ListEmptyComponent}
                  ListHeaderComponent={showHeader ? ProgressView : undefined}
        />
      </Animated.View>
    </GestureDetector>
  </GestureHandlerRootView>;
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
