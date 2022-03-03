import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import server from "../../logic/bloomable/server";
import { lightColors } from "../theme";

interface Props {
  onLoggedOut?: () => void;
}

const LoggedInView: React.FC<Props> = ({ onLoggedOut }) => {

  const logout = () => {
    server.logout();
    onLoggedOut?.();
  };

  return <View style={styles.container}>
    <TouchableOpacity onPress={logout}>
      <Text style={styles.logoutButton}>Log out</Text>
    </TouchableOpacity>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: lightColors.primaryLight,
    paddingVertical: 10,
  },
  header: {},
  logoutButton: {
    backgroundColor: lightColors.primary,
    color: lightColors.onPrimary,
    alignSelf: "flex-end",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 10,
  },
});

export default LoggedInView;
