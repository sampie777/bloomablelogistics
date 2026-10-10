import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { ordersLoadingProgressState } from "../../logic/recoil";
import { defaultFontFamilies } from "../theme";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface Props {}

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  open: "open",
  accepted: "accepted",
  fulfilled: "fulfilled",
  delivered: "delivered",
  "cancel-confirmed": "cancelled",
};

const formatPendingStatuses = (pendingStatuses: string[]): string => {
  if (!pendingStatuses || pendingStatuses.length === 0) {
    return "orders...";
  }

  const names = pendingStatuses.map(s => STATUS_DISPLAY_NAMES[s] || s);

  if (names.length === 1) {
    return `${names[0]} orders...`;
  }
  if (names.length === 2) {
    return `${names[0]} & ${names[1]} orders...`;
  }
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more...`;
};

const OrdersLoadingProgressBar: React.FC<Props> = () => {
  const { isLoading, completed, total, pendingStatuses } = useRecoilValue(ordersLoadingProgressState);
  const animatedProgress = useSharedValue(0);

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value}%`,
  }));

  useEffect(() => {
    if (!isLoading) {
      animatedProgress.value = 0;
      return;
    }

    animatedProgress.value = withTiming(percentage, {
      duration: 350,
      easing: Easing.out(Easing.ease),
    });
  }, [percentage, isLoading]);

  if (!isLoading) {
    return null;
  }

  const statusLabel = formatPendingStatuses(pendingStatuses);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          Loading {statusLabel}
        </Text>
        <Text style={styles.badgeText}>
          {completed} of {total} batches ({percentage}%)
        </Text>
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barBackground} />
        <Animated.View style={[styles.barFill, animatedStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff8e6",
    borderBottomWidth: 1,
    borderBottomColor: "#ffe082",
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: defaultFontFamilies.sansSerifMedium,
    fontWeight: "bold",
    fontSize: 13,
    color: "#d97706",
    flex: 1,
    marginRight: 8,
  },
  badgeText: {
    fontFamily: defaultFontFamilies.sansSerifLight,
    fontSize: 12,
    color: "#b45309",
  },
  barContainer: {
    height: 10,
    width: "100%",
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
  },
  barBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fde68a",
    borderRadius: 5,
  },
  barFill: {
    height: "100%",
    backgroundColor: "#f59e0b",
    borderRadius: 5,
  },
});

export default OrdersLoadingProgressBar;
