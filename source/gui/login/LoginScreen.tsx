import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import server from "../../logic/bloomable/server";
import LoggedInView from "./LoggedInView";
import NotLoggedInView from "./NotLoggedInView";
import LoadingOverlay from "../utils/LoadingOverlay";

interface Props {
  onLoggedInChange?: () => void;
}

const LoginScreen: React.FC<Props> = ({ onLoggedInChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(server.isLoggedIn());
  const [isProcessing, setIsProcessing] = useState(true);

  const _onLoggedInChange = () => {
    setIsLoggedIn(server.isLoggedIn());
    onLoggedInChange?.();
  };

  useEffect(() => {
    server.recallCookie()
      .then(() => {
        _onLoggedInChange();
        setIsProcessing(false);
      });
  });

  return <View style={[styles.container, { flex: isLoggedIn ? 0 : 1 }]}>
    <LoadingOverlay isVisible={isProcessing} />
    {isProcessing ? undefined : (!isLoggedIn ?
      <NotLoggedInView onLoggedIn={_onLoggedInChange} /> :
      <LoggedInView onLoggedOut={_onLoggedInChange} />)
    }
  </View>;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
});

export default LoginScreen;
