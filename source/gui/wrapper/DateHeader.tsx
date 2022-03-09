import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRecoilState } from "recoil";
import { selectedDateState } from "../../logic/recoil";
import { formatDateToWords } from "../../logic/utils";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../theme";

interface Props {

}

const DateHeader: React.FC<Props> = () => {
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);

  const nextDay = () => {
    const newDate = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
  };

  const previousDay = () => {
    const newDate = new Date(selectedDate.getTime() - 24 * 60 * 60 * 1000);
    setSelectedDate(newDate);
  };

  const today = () => {
    setSelectedDate(new Date());
  };

  return <View style={styles.container}>
    <TouchableOpacity style={styles.side} onPress={previousDay}>
      <FontAwesome5Icon name={"chevron-left"} style={styles.arrow} />
    </TouchableOpacity>

    <TouchableOpacity style={styles.middle} onPress={today}>
      <Text style={styles.currentDateText}>
        {formatDateToWords(selectedDate, "%dd-%mm-%YYYY")}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.side} onPress={nextDay}>
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
    minWidth: 60,
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
  },

  arrow: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default DateHeader;