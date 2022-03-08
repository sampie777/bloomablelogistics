import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import ProgressBar from "./ProgressBar";

interface Props {

}

const ProgressView: React.FC<Props> = () => {
  const orders = useRecoilValue(selectedDateOrdersState);
  const delivered = orders.filter(it => it.delivered).length;

  return <View style={styles.container}>
    {/*<Text style={styles.title}>Remaining:</Text>*/}
    <View style={styles.fractionView}>
      <Text style={[styles.fractionNumeratorText, (delivered === orders.length ? styles.delivered : {})]}>{orders.length - delivered}</Text>
      <Text style={styles.fractionDividerText}>/ {orders.length}</Text>
    </View>

    <ProgressBar />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    alignItems: "center",
  },
  title: {
    fontFamily: "sans-serif-light",
  },
  fractionView: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  fractionNumeratorText: {
    color: "#ec8700",
    fontSize: 70,
    fontFamily: "sans-serif-light",
  },
  fractionDividerText: {
    fontSize: 30,
    paddingBottom: 11,
    paddingLeft: 10,
    fontFamily: "sans-serif-thin",
  },
  delivered: {
    color: "#00c900",
  },
});

export default ProgressView;
