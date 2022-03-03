import React, { useEffect, useState } from "react";
import { FlatList, ListRenderItemInfo, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Order, Orders } from "../../logic/orders";
import OrderListItem from "./OrderListItem";
import ListEmptyComponent from "./ListEmptyComponent";
import ListHeaderComponent from "./ListHeaderComponent";

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
          .reverse()
        );
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
              keyExtractor={order => order.id + ""}
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
