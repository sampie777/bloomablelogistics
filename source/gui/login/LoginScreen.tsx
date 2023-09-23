import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import LoggedInView from "./LoggedInView";
import NotLoggedInView from "./NotLoggedInView";
import LoadingOverlay from "../utils/LoadingOverlay";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamList, Routes } from "../../routes";
import { Server } from "../../logic/bloomable/server";

const LoginScreen: React.FC<NativeStackScreenProps<ParamList>> = ({ navigation }) => {
  const isMounted = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(Server.isLoggedIn());
  const [isProcessing, setIsProcessing] = useState(true);

  const onLoggedInChange = () => {
    if (!Server.isLoggedIn()) {
      return;
    }

    navigation.navigate(Routes.Main);
    navigation.reset({
      index: 0,
      routes: [{ name: Routes.Main }],
    });
  };

  useEffect(() => {
    isMounted.current = true;

    if (!Server.isCredentialsRecalled()) {
      Server.recallCredentials()
        .catch(() => null)
        .then(() => {
          if (!isMounted.current) {
            return;
          }
          setIsProcessing(false);
          onLoggedInChange();
        });
    } else {
      onLoggedInChange();
      setIsProcessing(false);
    }
    return () => {
      isMounted.current = false;
    };
  }, []);

  return <View style={styles.container}>
    <LoadingOverlay isVisible={isProcessing} />
    {isProcessing ? undefined : (!isLoggedIn ?
      <NotLoggedInView onLoggedIn={onLoggedInChange} /> :
      <LoggedInView onLoggedOut={onLoggedInChange} />)
    }
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});

export default LoginScreen;
