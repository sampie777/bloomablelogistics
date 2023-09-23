import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Routes } from "../routes";
import MainWrapper from "./wrapper/MainWrapper";
import LoginScreen from "./login/LoginScreen";
import SettingsScreen from "./settings/SettingsScreen";
import { NavigationContainer } from "@react-navigation/native";
import { RecoilRoot } from "recoil";
import { settings } from "../logic/settings/settings";
import RejectOrderScreen from "./orders/order/status/RejectOrderScreen";

const RootNav = createNativeStackNavigator();

interface Props {

}

const AppRoot: React.FC<Props> = () => {
  useEffect(() => {
    settings.load();
  });

  return <RecoilRoot>
    <NavigationContainer>
      <RootNav.Navigator initialRouteName={Routes.Login}
                         screenOptions={{}}>
        <RootNav.Screen name={Routes.Main} component={MainWrapper}
                        options={{ headerShown: false }} />
        <RootNav.Screen name={Routes.Login} component={LoginScreen}
                        options={{ headerShown: false }} />
        <RootNav.Screen name={Routes.Settings} component={SettingsScreen}
                        options={{ headerShown: true }} />
        <RootNav.Screen name={Routes.RejectOrder} component={RejectOrderScreen as any}
                        options={{ headerShown: true }} />
      </RootNav.Navigator>
    </NavigationContainer>
  </RecoilRoot>;
};

export default AppRoot;
