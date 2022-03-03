import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import server, { LoginError } from "../../logic/bloomable/server";
import LoadingOverlay from "../utils/LoadingOverlay";
import { lightColors } from "../theme";
import { displayName } from "../../../app.json";

interface Props {
  onLoggedIn?: () => void;
}

const NotLoggedInView: React.FC<Props> = ({ onLoggedIn }) => {
  let isMounted = true;
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  let passwordInput: TextInput | null = null;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  const validate = (): boolean => {
    if (!username) {
      setErrorMessage("Username cannot be empty");
      return false;
    }
    if (!password) {
      setErrorMessage("Password cannot be empty");
      return false;
    }
    return true;
  };

  const login = () => {
    if (!validate()) {
      return;
    }

    setErrorMessage(undefined);
    setIsProcessing(true);

    server.login(username, password)
      .then(() => {
        if (!isMounted) {
          return;
        }

        if (!server.isLoggedIn()) {
          return setErrorMessage("Failed to log in. Are your credentials correct?");
        }

        onLoggedIn?.();
      })
      .catch(error => {
        if (!isMounted) {
          return;
        }

        if (error instanceof LoginError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(error.toString());
        }
      })
      .finally(() => {
        if (!isMounted) {
          return;
        }

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
                 autoComplete={"username"}
                 returnKeyType={"next"}
                 onSubmitEditing={() => passwordInput?.focus()}
                 blurOnSubmit={false} />

      <TextInput placeholder={"Password"}
                 ref={ref => passwordInput = ref}
                 style={styles.input}
                 maxLength={255}
                 value={password}
                 onChangeText={setPassword}
                 textContentType={"password"}
                 autoComplete={"password"}
                 secureTextEntry={true}
                 returnKeyType={"send"}
                 onSubmitEditing={login} />

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
