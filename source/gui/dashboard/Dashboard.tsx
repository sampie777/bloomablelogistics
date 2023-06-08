import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import OrdersList from "../orders/OrdersList";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { lightColors } from "../theme";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { ParamList, routes } from "../../routes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const Dashboard: React.FC<NativeStackScreenProps<ParamList>> = ({ navigation }) => {
  const orders = useRecoilValue(selectedDateOrdersState);

  const openSettings = () => {
    navigation.navigate(routes.Settings);
  };

  return <View style={styles.container}>
    <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
      <FontAwesome5Icon name={"cog"} style={styles.settingsButtonIcon} />
    </TouchableOpacity>
    <OrdersList orders={orders}
                showHeader={true} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
  settingsButton: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: lightColors.button,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    top: 15,
    left: 15,
    overflow: "hidden",
    zIndex: 1000,
  },
  settingsButtonIcon: {
    color: lightColors.textLighter,
    fontSize: 22,
  },
});

export default Dashboard;
