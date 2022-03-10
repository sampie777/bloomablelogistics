import React from "react";
import { StyleSheet, View } from "react-native";
import OrdersList from "../orders/OrdersList";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";

interface Props {

}

const Dashboard: React.FC<Props> = () => {
  const orders = useRecoilValue(selectedDateOrdersState);
  return <View style={styles.container}>
    <OrdersList orders={orders}
                showHeader={true} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
