import React, { useEffect, useRef, useState } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Orders } from "../../logic/orders";
import OrderListItem from "./order/OrderListItem";
import ListEmptyComponent from "./ListEmptyComponent";
import ListHeaderComponent from "./ListHeaderComponent";
import { Order } from "../../logic/models";

interface Props {

}

const OrdersList: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const fetchPage = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchOrders = () => {
    fetchPage.current = 0;
    setOrders([]);
    fetchNextOrderPage();
  };

  const fetchNextOrderPage = () => {
    setIsProcessing(true);
    setErrorMessage(undefined);

    fetchPage.current++;
    Orders.fetchPage(fetchPage.current)
      .then(_orders => {
        if (!isMounted.current) {
          return;
        }

        if (fetchPage.current > 1) {
          _orders = orders.concat(_orders);
        }

        setAndSortOrders(_orders);
      })
      .catch(error => {
        if (!isMounted.current) {
          return;
        }
        setErrorMessage(error.toString());
      })
      .finally(() => {
        if (!isMounted.current) {
          return;
        }
        setIsProcessing(false);
      });
  };

  const setAndSortOrders = (_orders: Order[]) => {
    setOrders(_orders
      .sort((a, b) => {
        if (a.deliverAtDate && b.deliverAtDate) {
          return a.deliverAtDate.getTime() - b.deliverAtDate.getTime();
        } else if (a.deliverAtDate) {
          return 1;
        } else if (b.deliverAtDate) {
          return -1;
        } else {
          return (a.number || 0) - (b.number || 0);
        }
      })
      .reverse());
  };

  const onOrderUpdated = () => {
    setAndSortOrders(orders);
  };

  const renderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return <OrderListItem order={item} onOrderUpdated={onOrderUpdated} />;
  };

  return <View style={styles.container}>
    {errorMessage === undefined ? undefined :
      <Text style={styles.error}>{errorMessage}</Text>}

    <FlatList data={orders}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl onRefresh={fetchOrders}
                                              refreshing={isProcessing} />}
              renderItem={renderOrderItem}
              keyExtractor={order => order.id + ""}
              onEndReached={fetchNextOrderPage}
              onEndReachedThreshold={2}
              ListEmptyComponent={ListEmptyComponent}
              ListHeaderComponent={<ListHeaderComponent orders={orders} />}
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
