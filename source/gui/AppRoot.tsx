import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { routes } from "../routes";
import MainWrapper from "./wrapper/MainWrapper";
import LoginScreen from "./login/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { RecoilRoot } from "recoil";

const RootNav = createNativeStackNavigator();

interface Props {

}

const AppRoot: React.FC<Props> = () => {
  return <RecoilRoot>
    <NavigationContainer>
      <RootNav.Navigator initialRouteName={routes.Login}
                         screenOptions={{}}>
        <RootNav.Screen name={routes.Main} component={MainWrapper}
                        options={{ headerShown: false }} />
        <RootNav.Screen name={routes.Login} component={LoginScreen}
                        options={{ headerShown: false }} />
      </RootNav.Navigator>
    </NavigationContainer>
  </RecoilRoot>;
};

export default AppRoot;
