import { ColorValue } from "react-native";
import { isIOS } from "../logic/utils/utils";

export interface ThemeColors {
  primary: ColorValue,
  primaryVariant: ColorValue,
  primaryLight: ColorValue,
  background: ColorValue,
  surface1: ColorValue,
  surface2: ColorValue,
  surface3: ColorValue,
  onPrimary: ColorValue,
  text: ColorValue,
  textLight: ColorValue,
  textLighter: ColorValue,
  textHeader: ColorValue,
  textError: ColorValue,
  verseTitle: ColorValue,
  url: ColorValue,
  button: ColorValue,
  buttonVariant: ColorValue,
  border: ColorValue,
  borderLight: ColorValue,
  borderVariant: ColorValue,
  notesColor: ColorValue,
  notesLines: ColorValue,
  switchComponentThumb: ColorValue,
  switchComponentBackground?: ColorValue,
}

export const lightColors: ThemeColors = {
  primary: "dodgerblue",
  primaryVariant: "dodgerblue",
  primaryLight: "#63adff",
  background: "#f1f1f1",
  surface1: "#fcfcfc",
  surface2: "#ffffff",
  surface3: "#707070",
  onPrimary: "#fff",
  text: "#666",
  textLight: "#7a7a7a",
  textLighter: "#8d8d8e",
  textHeader: "#1c1c1c",
  textError: "firebrick",
  verseTitle: "#333",
  url: "#57a4fd",
  button: "#fcfcfc",
  buttonVariant: "#f5f5f5",
  border: "#ddd",
  borderLight: "#eee",
  borderVariant: "#ccc",
  notesColor: "#222",
  notesLines: "#444",
  switchComponentThumb: isIOS ? "#fff" : "dodgerblue",
  switchComponentBackground: isIOS ? "#eee" : undefined,
};

export interface ThemeFontFamilies {
  // sansSerif: string,
  sansSerifLight: string,
  sansSerifThin: string,
}

export const defaultFontFamilies: ThemeFontFamilies = {
  // sansSerif: "sans-serif",
  sansSerifLight: "sans-serif-light",
  sansSerifThin: "sans-serif-thin",
};
