import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import ProgressBar from "./ProgressBar";
import { lightColors } from "../theme";

interface Props {

}

const ProgressView: React.FC<Props> = () => {
  const orders = useRecoilValue(selectedDateOrdersState)
    .filter(it => !it.deleted && it.accepted);
  const delivered = orders.filter(it => it.delivered).length;

  return <View style={styles.container}>
    <View style={styles.fractionView}>
      <Text
        style={[styles.fractionNumeratorText, (delivered === orders.length ? styles.delivered : {})]}>{orders.length - delivered}</Text>
      <Text style={styles.fractionDividerText}>/ {orders.length}</Text>
      <Text style={styles.description}>remaining</Text>
    </View>

    <ProgressBar />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
    alignItems: "center",
  },
  fractionView: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  fractionNumeratorText: {
    color: "#ec8700",
    fontSize: 70,
    fontFamily: "sans-serif-light",
    marginLeft: 40,
  },
  fractionDividerText: {
    fontSize: 30,
    paddingBottom: 11,
    paddingLeft: 10,
    fontFamily: "sans-serif-thin",
    color: lightColors.text,
  },
  description: {
    paddingBottom: 15,
    paddingLeft: 8,
    fontFamily: "sans-serif-light",
    color: lightColors.textLighter,
  },
  delivered: {
    color: "#00c900",
  },
});

export default ProgressView;
