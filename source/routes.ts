export type ParamList = {
  Main: undefined,
  Login: undefined,
  Dashboard: undefined,
  Map: undefined,
}

export const routes = {
  Main: "Main" as keyof ParamList,
  Login: "Login" as keyof ParamList,
  Dashboard: "Dashboard" as keyof ParamList,
  Map: "Map" as keyof ParamList,
};
