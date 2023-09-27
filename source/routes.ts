
export type ParamList = {
  Main: undefined,
  Login: undefined,
  Settings: undefined,
  Dashboard: undefined,
  Map: undefined,
  RejectOrder: {
    orderId?: string
  },
}

export namespace Routes {
  export const Main = "Main";
  export const Login = "Login";
  export const Settings = "Settings";
  export const Dashboard = "Dashboard";
  export const Map = "Map";
  export const RejectOrder = "RejectOrder";
}
