import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { lightColors } from "../theme";

interface Props {

}

const ProgressBar: React.FC<Props> = () => {
  const orders = useRecoilValue(selectedDateOrdersState)
    .filter(it => !it.deleted && it.accepted);

  if (orders.length === 0) {
    return null;
  }

  const delivered = orders.filter(it => it.delivered).length;
  const percentageDelivered = Math.round(delivered / orders.length * 100);

  return <View style={styles.container}>
    <Text style={styles.title}>Delivered:</Text>

    <View style={styles.bar}>
      <View style={styles.total}>
        <View style={styles.totalBackground} />
        <View style={[styles.delivered, {
          width: percentageDelivered + "%",
          minWidth: percentageDelivered > 0 ? 20 : 0,
        }]} />
      </View>
      <Text style={styles.percentage}>
        {percentageDelivered} %
      </Text>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    color: lightColors.textLighter,
    fontFamily: "sans-serif-light",
  },
  bar: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  total: {
    flex: 1,
    height: 20,
    marginLeft: 20,
  },
  totalBackground: {
    backgroundColor: lightColors.surface1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: lightColors.borderVariant,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  delivered: {
    flex: 1,
    backgroundColor: "#00c900",
    borderRadius: 10,
  },
  percentage: {
    paddingLeft: 20,
    fontFamily: "sans-serif-light",
    color: lightColors.text,
  },
});

export default ProgressBar;
