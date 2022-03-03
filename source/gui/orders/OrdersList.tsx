import React, { useEffect, useState } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Order, Orders } from "../../logic/orders";
import OrderListItem from "./OrderListItem";
import ListEmptyComponent from "./ListEmptyComponent";

interface Props {

}

const OrdersList: React.FC<Props> = () => {
  let isMounted = true;
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchOrders = () => {
    setIsProcessing(true);
    setErrorMessage(undefined);

    Orders.fetchAll()
      .then(_orders => {
        if (!isMounted) {
          return;
        }
        setOrders(_orders);
      })
      .catch(error => {
        if (!isMounted) {
          return;
        }
        setErrorMessage(error.toString());
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }
        setIsProcessing(false);
      });
  };

  const renderOrderItem = ({ item }: ListRenderItemInfo<Order>) => {
    return <OrderListItem order={item} />;
  };

  return <View style={styles.container}>
    {errorMessage === undefined ? undefined :
      <Text style={styles.error}>{errorMessage}</Text>}

    <FlatList data={orders}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl onRefresh={fetchOrders}
                                              refreshing={isProcessing} />}
              renderItem={renderOrderItem}
              keyExtractor={order => order.number + order.clientName}
              ListEmptyComponent={ListEmptyComponent}
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
