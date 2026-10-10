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
        <View style={styles.badgeSpacer} />
      }
    </TouchableOpacity>

    <TouchableOpacity style={styles.middle} onPress={today}>
      <Text style={styles.currentDateText}>
        {formatDateToWords(selectedDate, "%dddd (%dd-%mm-%YYYY)")}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.side} onPress={nextDay}>
      {!upcomingOrders || upcomingOrders.length === 0 ? undefined :
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{upcomingOrders.length}</Text>
        </View>
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
    paddingVertical: 15,
  },
  currentDateText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
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
    height: 18,
    minWidth: 18,
    paddingHorizontal: 5,
    backgroundColor: lightColors.background,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    fontSize: 12,
    color: lightColors.text,
    textAlign: "center",
    includeFontPadding: false,
  },
  badgeSpacer: {
    width: 28,
  },
});

export default DateHeader;
