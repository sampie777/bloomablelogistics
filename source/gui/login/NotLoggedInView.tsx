import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import server, { LoginError } from "../../logic/bloomable/server";
import LoadingOverlay from "../utils/LoadingOverlay";
import { lightColors } from "../theme";
import { displayName } from "../../../app.json";

interface Props {
  onLoggedIn?: () => void;
}

const NotLoggedInView: React.FC<Props> = ({ onLoggedIn }) => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const login = () => {
    setErrorMessage(undefined);
    setIsProcessing(true);

    server.login(username, password)
      .then(() => {
        if (!server.isLoggedIn()) {
          return setErrorMessage("Failed to log in. Are your credentials correct?");
        }

        onLoggedIn?.();
      })
      .catch(error => {
        if (error instanceof LoginError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(error.toString());
        }
      })
      .finally(() => {
        setIsProcessing(false);
      });
  };

  return <View style={styles.container}>
    <LoadingOverlay isVisible={isProcessing} />

    <View style={styles.header}>
      <Text style={styles.appName}>{displayName}</Text>
    </View>

    <View style={styles.form}>
      {errorMessage === undefined ? undefined :
        <Text style={styles.error}>{errorMessage}</Text>}

      <TextInput placeholder={"Username"}
                 style={styles.input}
                 maxLength={255}
                 value={username}
                 onChangeText={setUserName}
                 autoComplete={"username"} />

      <TextInput placeholder={"Password"}
                 style={styles.input}
                 maxLength={255}
                 value={password}
                 onChangeText={setPassword}
                 textContentType={"password"}
                 autoComplete={"password"}
                 secureTextEntry={true} />

      <TouchableOpacity onPress={login}>
        <Text style={styles.button}>Log in</Text>
      </TouchableOpacity>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    color: lightColors.primary,
    fontSize: 28,
    fontFamily: "sans-serif-light",
  },
  form: {
    flex: 3,
  },
  error: {
    color: "#800",
    marginVertical: 10,
    marginHorizontal: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: lightColors.primary,
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 30,
    paddingHorizontal: 20,
    color: lightColors.text,
  },
  button: {
    backgroundColor: lightColors.primary,
    borderRadius: 15,
    marginVertical: 10,
    marginHorizontal: 30,
    paddingVertical: 15,
    textAlign: "center",
    color: lightColors.onPrimary,
  },
});

export default NotLoggedInView;
