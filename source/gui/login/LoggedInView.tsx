import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { lightColors } from "../theme";
import { Server } from "../../logic/bloomable/server";
import { useSetRecoilState } from "recoil";
import { ordersState } from "../../logic/recoil";
import LoadingOverlay from "../utils/LoadingOverlay";

interface Props {
  onLoggedOut?: () => void;
}

const LoggedInView: React.FC<Props> = ({ onLoggedOut }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const setOrders = useSetRecoilState(ordersState);

  const logout = async () => {
    setIsProcessing(true);
    try {
      setOrders([]);
      await Server.logout();
    } finally {
      setIsProcessing(false);
      onLoggedOut?.();
    }
  };

  return <View style={styles.container}>
    <LoadingOverlay isVisible={isProcessing} text={"Logging out..."} />
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
  logoutButton: {
    padding: 10,
    backgroundColor: lightColors.primary,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: lightColors.textLight,
  },
});

export default LoggedInView;
