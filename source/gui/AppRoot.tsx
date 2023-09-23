import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { routes } from "../routes";
import MainWrapper from "./wrapper/MainWrapper";
import LoginScreen from "./login/LoginScreen";
import SettingsScreen from "./settings/SettingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { RecoilRoot } from "recoil";
import { settings } from "../logic/settings/settings";
import { Mocks } from "../logic/demoData/mocks";

const RootNav = createNativeStackNavigator();

interface Props {

}

const AppRoot: React.FC<Props> = () => {
  useEffect(() => {
    Mocks.setupDemoData();
    settings.load();
  });

  return <RecoilRoot>
    <NavigationContainer>
      <RootNav.Navigator initialRouteName={routes.Login}
                         screenOptions={{}}>
        <RootNav.Screen name={routes.Main} component={MainWrapper}
                        options={{ headerShown: false }} />
        <RootNav.Screen name={routes.Login} component={LoginScreen}
                        options={{ headerShown: false }} />
        <RootNav.Screen name={routes.Settings} component={SettingsScreen}
                        options={{ headerShown: true }} />
      </RootNav.Navigator>
    </NavigationContainer>
  </RecoilRoot>;
};

export default AppRoot;
