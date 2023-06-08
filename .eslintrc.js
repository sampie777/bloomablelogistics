module.exports = {
  root: true,
  extends: "@react-native-community",
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js"],
      rules: {
        "@typescript-eslint/no-shadow": ["error"],
        "no-shadow": "off",
        "no-undef": "off",
        "no-bitwise": "off",
        "prettier/prettier": "off",
        "no-trailing-spaces": "off",
        "react-native/no-inline-styles": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "no-return-assign": "off",
        quotes: "off",
        curly: "off",
      },
    },
  ],
};
