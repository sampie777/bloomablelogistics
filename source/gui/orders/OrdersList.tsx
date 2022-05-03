import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, GestureResponderEvent, ListRenderItemInfo, StyleSheet, View } from "react-native";
import OrderItem from "./order/OrderItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/models";
import ProgressView from "../dashboard/ProgressView";
import { calculateSwipeDirection, getNextDay, getPreviousDay } from "../../logic/utils";
import { useRecoilState } from "recoil";
import { selectedDateState } from "../../logic/recoil";
import GestureRecognizer from "react-native-swipe-gestures";
import Animated, { Easing } from "react-native-reanimated";

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

  const animateDayTransition = (direction: number, newDate?: Date) => {
    swipeDirection.current = direction;

    Animated.timing(animatedHorizontalOffset, {
      toValue: direction * screenWidth,
      duration: 200,
      easing: direction === 0 ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
    }).start(() => {
      if (newDate) {
        setSelectedDate(newDate);
      }
    });
  };

  const onSwipeEnd = (e: GestureResponderEvent) => {
    endX = e.nativeEvent.pageX;
    endY = e.nativeEvent.pageY;

    const direction = calculateSwipeDirection(startX, startY, endX, endY);
    if (direction === "SWIPE_LEFT") {
      goToNextDay();
    } else if (direction === "SWIPE_RIGHT") {
      goToPreviousDay();
    }
  };

  const renderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return <OrderItem order={item} />;
  };

  return <View style={styles.container}>
    <GestureRecognizer style={styles.container}
                       onTouchStart={(e) => {
                         startX = e.nativeEvent.pageX;
                         startY = e.nativeEvent.pageY;
                       }}
                       onTouchEnd={onSwipeEnd}
                       config={{
                         velocityThreshold: 1,
                         directionalOffsetThreshold: 60,
                         gestureIsClickThreshold: 100,
                       }}>
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
    </GestureRecognizer>
  </View>;
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
