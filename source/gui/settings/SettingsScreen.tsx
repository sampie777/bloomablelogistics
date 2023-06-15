import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import SwitchComponent from "./components/SwitchComponent";
import PressableComponent from "./components/PressableComponent";
import Server from "../../logic/bloomable/server";
import { ParamList, routes } from "../../routes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { settings } from "../../logic/settings/settings";
import { Notifications } from "../../logic/notifications";
import { getBuildNumber, getVersion } from "react-native-device-info";
import { defaultFontFamilies, lightColors } from "../theme";

const Header: React.FC<{ title: string, isVisible?: boolean }> = ({ title, isVisible = true }) => {
  return !isVisible ? null : <Text style={styles.settingHeader}>{title}</Text>;
};

const SettingsScreen: React.FC<NativeStackScreenProps<ParamList>> = ({ navigation }) => {
  return <View style={styles.container}>
    <ScrollView
      contentContainerStyle={styles.scrollContainer}>

      <Header title={"Notifications"} />
      <SwitchComponent settingsKey={"notificationsShowForNewOrders"}
                       title={"New order"}
                       description={"Show notifications when new orders have been received"}
                       callback={() => {
                         settings.notificationsShowForNewOrders
                           ? Notifications.subscribe()
                           : Notifications.unsubscribe();
                       }} />

      <Header title={"Account"} />
      <PressableComponent title={"Log out"}
                          description={`Currently logged in as '${Server.getUsername()}'`}
                          onPress={() => {
                            Server.logout();
                            navigation.navigate(routes.Login);
                            navigation.reset({
                              index: 0,
                              routes: [{ name: routes.Login }],
                            });
                          }} />

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          version: {getVersion()} ({getBuildNumber()}) {process.env.NODE_ENV === "production" ? undefined : `(${process.env.NODE_ENV})`}
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

  settingHeader: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
    color: "#999",
  },

  versionContainer: {
    marginTop: 100,
  },
  versionText: {
    textAlign: "center",
    color: lightColors.textLighter,
    fontSize: 12,
    fontFamily: defaultFontFamilies.sansSerifLight,
  },
});


export default SettingsScreen;
