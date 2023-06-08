import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import SwitchComponent from "./components/SwitchComponent";
import PressableComponent from "./components/PressableComponent";
import Server from "../../logic/bloomable/server";
import { ParamList, routes } from "../../routes";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

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
                       description={"Show notifications when new orders have been received"} />

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
});


export default SettingsScreen;
