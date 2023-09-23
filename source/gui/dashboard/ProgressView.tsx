import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import ProgressBar from "./ProgressBar";
import { defaultFontFamilies, lightColors } from "../theme";

interface Props {

}

const ProgressView: React.FC<Props> = () => {
  const orders = useRecoilValue(selectedDateOrdersState)
    .filter(it => it.status === "accepted" || it.status === "fulfilled" || it.status === "delivered");
  const delivered = orders.filter(it => it.status === "fulfilled" || it.status === "delivered").length;

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
    fontFamily: defaultFontFamilies.sansSerifLight,
    marginLeft: 40,
  },
  fractionDividerText: {
    fontSize: 30,
    paddingBottom: 11,
    paddingLeft: 10,
    fontFamily: defaultFontFamilies.sansSerifThin,
    color: lightColors.text,
  },
  description: {
    paddingBottom: 15,
    paddingLeft: 8,
    fontFamily: defaultFontFamilies.sansSerifLight,
    color: lightColors.textLighter,
  },
  delivered: {
    color: "#00c900",
  },
});

export default ProgressView;
