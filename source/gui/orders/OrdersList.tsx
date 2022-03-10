import React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import OrderListItem from "./order/OrderListItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/models";
import ProgressView from "../dashboard/ProgressView";

interface Props {
  orders: Order[];
  showHeader: boolean;
}

const OrdersList: React.FC<Props> = ({ orders, showHeader }) => {
  const renderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return <OrderListItem order={item} />;
  };

  return <View style={styles.container}>
    <FlatList data={orders}
              contentContainerStyle={styles.list}
              renderItem={renderOrderItem}
              keyExtractor={order => order.id + ""}
              onEndReachedThreshold={2}
              ListEmptyComponent={ListEmptyComponent}
              ListHeaderComponent={showHeader ? ProgressView : undefined}
    />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    color: "#800",
  },
  list: {
    paddingTop: 30,
    paddingBottom: 80,
  },
});

export default OrdersList;
