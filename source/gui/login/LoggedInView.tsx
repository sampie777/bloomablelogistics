import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { lightColors } from "../theme";
import { Server } from "../../logic/bloomable/server";

interface Props {
  onLoggedOut?: () => void;
}

const LoggedInView: React.FC<Props> = ({ onLoggedOut }) => {

  const logout = () => {
    Server.logout();
    onLoggedOut?.();
  };

  return <View style={styles.container}>
    <TouchableOpacity onPress={logout} style={styles.logoutButton}>
      <Text style={styles.logoutButtonText}>Log out</Text>
    </TouchableOpacity>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {},
  logoutButton: {
  },
  logoutButtonText: {
    backgroundColor: lightColors.primary,
    color: lightColors.onPrimary,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
});

export default LoggedInView;
