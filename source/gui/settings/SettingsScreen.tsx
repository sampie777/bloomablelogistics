import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import SwitchComponent from "./components/SwitchComponent";
import PressableComponent from "./components/PressableComponent";
import { ParamList, Routes } from "../../routes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { settings } from "../../logic/settings/settings";
import { Notifications } from "../../logic/notifications";
import { getBuildNumber, getVersion } from "react-native-device-info";
import { defaultFontFamilies, lightColors } from "../theme";
import { useRecoilState, useSetRecoilState } from "recoil";
import { orderActionInProgressState, ordersState, selectedDateState } from "../../logic/recoil";
import { Server } from "../../logic/bloomable/server";
import { getNextDay } from "../../logic/utils/utils";
import NumberComponent from "./components/NumberComponent";
import LoadingOverlay from "../utils/LoadingOverlay";

const Header: React.FC<{ title: string, isVisible?: boolean }> = ({ title, isVisible = true }) => {
  return !isVisible ? null : (
    <View style={styles.settingHeaderContainer}>
      <Text style={styles.settingHeader}>{title}</Text>
    </View>
  );
};

const SettingsScreen: React.FC<NativeStackScreenProps<ParamList>> = ({ navigation }) => {
  const [orderActionInProgress, setOrderActionInProgress] = useRecoilState(orderActionInProgressState);
  const [selectedDate, setSelectedDate] = useRecoilState(selectedDateState);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const setOrders = useSetRecoilState(ordersState);

  return <View style={styles.container}>
    <LoadingOverlay isVisible={isLoggingOut} text={"Logging out..."} />
    <ScrollView
      contentContainerStyle={styles.scrollContainer}>

      <Header title={"Orders"} />
      <NumberComponent settingsKey={"maxPastOrderPagesToFetch"}
                       title={"Past orders to load"}
                       description={"Specify the amount of delivered orders to load. Increase this number if you want to see more past orders."}
                       min={0}
                       valueRender={it => (it * 15).toString()} />
      <SwitchComponent settingsKey={"disableOrderActions"}
                       title={"Passive mode"}
                       description={"Disable applying actions to orders to prevent oopsies"}
                       callback={() => {
                         // Just quickly refresh the GUI so the new setting is applied to the buttons.
                         setOrderActionInProgress(true);
                         setOrderActionInProgress(false);
                       }} />
      <SwitchComponent settingsKey={"useInitialCoordinatesForOrders"}
                       title={"Recipient coordinates from Bloomable"}
                       description={"Use the coordinates from Bloomable for orders. Turn this off to use Google's API for calculating order coordinates."}
                       callback={() => {
                         // Just quickly refresh the GUI so the new setting is applied to the buttons.
                         setOrderActionInProgress(true);
                         setOrderActionInProgress(false);
                       }} />
      <SwitchComponent settingsKey={"orderDaysAddNextDayOnSunday"}
                       title={"Add Monday to Sunday"}
                       description={"On Sundays, also show the upcoming orders of Monday (the next day) in the dashboard."}
                       callback={() => {
                         // Just quickly refresh the GUI so the new setting is applied to the buttons.
                         setSelectedDate(getNextDay(selectedDate));
                         setSelectedDate(selectedDate);
                       }} />

      <Header title={"Notifications"} />
      <SwitchComponent settingsKey={"notificationsShowForNewOrders"}
                       title={"New order"}
                       description={"Show notifications when new orders have been received"}
                       callback={async () => {
                         if (settings.notificationsShowForNewOrders) {
                           Notifications.subscribe();
                         } else {
                           // For good measures, as the unsubscribing doesn't seem to always work.
                           await Notifications.unsubscribe();
                           await Notifications.unsubscribe();
                           await Notifications.unsubscribe();
                         }
                       }} />

      <Header title={"Account"} />
      <PressableComponent title={"Log out"}
                          description={`Currently logged in as '${Server.getCredentials().username}'`}
                          onPress={async () => {
                            setIsLoggingOut(true);
                            try {
                              await Server.logout();
                              setOrders([]);
                            } finally {
                              setIsLoggingOut(false);
                              navigation.reset({
                                index: 0,
                                routes: [{ name: Routes.Login }],
                              });
                            }
                          }} />

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          version: {getVersion()} ({getBuildNumber()}) {process.env.NODE_ENV === "production" ? undefined : `(${process.env.NODE_ENV})`}\
        </Text>
      </View>
    </ScrollView>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 100,
  },

  settingHeaderContainer: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  settingHeader: {
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
    color: "#999",
  },

  versionContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  versionText: {
    textAlign: "center",
    fontFamily: defaultFontFamilies.sansSerifThin,
    color: lightColors.textLighter,
  },
});

export default SettingsScreen;
