import React from "react";
import { StyleSheet, View } from "react-native";
import OrdersList from "../orders/OrdersList";

interface Props {

}

const Dashboard: React.FC<Props> = () => {
  return <View style={styles.container}>
    <OrdersList />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard;
