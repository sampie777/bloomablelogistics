import React from "react";
import { FlatList, ListRenderItemInfo, StyleSheet, View } from "react-native";
import OrderListItem from "./order/OrderListItem";
import ListEmptyComponent from "./ListEmptyComponent";
import { Order } from "../../logic/models";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import ProgressView from "../dashboard/ProgressView";

interface Props {
  setMapOrders?: (orders: Order[]) => void;
}

const OrdersList: React.FC<Props> = ({ setMapOrders }) => {
  const orders = useRecoilValue(selectedDateOrdersState);

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
              ListHeaderComponent={<ProgressView />}
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
    // flex: 1,
  },
});

export default OrdersList;
