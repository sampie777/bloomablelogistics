import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import server from "../../logic/bloomable/server";
import LoggedInView from "./LoggedInView";
import NotLoggedInView from "./NotLoggedInView";
import LoadingOverlay from "../utils/LoadingOverlay";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ParamList, routes } from "../../routes";

interface Props {
}

const LoginScreen: React.FC<NativeStackScreenProps<ParamList>> = ({ navigation }) => {
  const isMounted = useRef(false);
  const [isLoggedIn, setIsLoggedIn] = useState(server.isLoggedIn());
  const [isProcessing, setIsProcessing] = useState(true);

  const onLoggedInChange = () => {
    if (!server.isLoggedIn()) {
      return;
    }

    navigation.navigate(routes.Main);
    navigation.reset({
      index: 0,
      routes: [{ name: routes.Main }],
    });
  };

  useEffect(() => {
    isMounted.current = true;

    if (!server.isCredentialsRecalled()) {
      server.recallCredentials()
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
