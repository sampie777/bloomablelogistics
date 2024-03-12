import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRecoilState, useRecoilValue } from "recoil";
import { selectedDateState, upcomingOrdersState } from "../../logic/recoil";
import { formatDateToWords, getNextDay, getPreviousDay } from "../../logic/utils/utils";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../theme";

interface Props {

}

const DateHeader: React.FC<Props> = () => {
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);
  const upcomingOrders = useRecoilValue(upcomingOrdersState);

  const nextDay = () => {
    const newDate = getNextDay(selectedDate);
    setSelectedDate(newDate);
  };

  const previousDay = () => {
    const newDate = getPreviousDay(selectedDate);
    setSelectedDate(newDate);
  };

  const today = () => {
    setSelectedDate(new Date());
  };

  return <View style={styles.container}>
    <TouchableOpacity style={styles.side} onPress={previousDay}>
      <FontAwesome5Icon name={"chevron-left"} style={styles.arrow} />
      {!upcomingOrders || upcomingOrders.length === 0 ? undefined :
        <View style={{ width: styles.badge.minWidth + styles.badge.marginRight }} />
      }
    </TouchableOpacity>

    <TouchableOpacity style={styles.middle} onPress={today}>
      <Text style={styles.currentDateText}>
        {formatDateToWords(selectedDate, "%dddd (%dd-%mm-%YYYY)")}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.side} onPress={nextDay}>
      {!upcomingOrders || upcomingOrders.length === 0 ? undefined :
        <Text style={styles.badge}>{upcomingOrders.length}</Text>
      }

      <FontAwesome5Icon name={"chevron-right"} style={styles.arrow} />
    </TouchableOpacity>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: lightColors.surface2,
    borderBottomWidth: 1,
    borderBottomColor: lightColors.border,
  },
  side: {
    alignSelf: "stretch",
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  middle: {
    flex: 1,
    marginHorizontal: 10,
  },
  currentDateText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 15,
    textTransform: "capitalize",
    color: lightColors.text,
  },

  arrow: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    color: lightColors.text,
  },

  badge: {
    fontSize: 12,
    height: 18,
    minWidth: 18,
    backgroundColor: lightColors.background,
    lineHeight: 17,
    color: lightColors.text,
    borderRadius: 20,
    textAlign: "center",
    marginRight: 10,
  },
});

export default DateHeader;
