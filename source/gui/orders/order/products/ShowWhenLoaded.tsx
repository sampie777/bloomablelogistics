import React, { ReactElement } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Product } from "../../../../logic/orders/models";
import { lightColors } from "../../../theme";

interface Props {
  product: Product;
  component?: ReactElement;
  children?: React.ReactNode;
}

const ShowWhenLoaded: React.FC<Props> = ({ product, component, children }) => {
  if (product._detailsLoaded) return component ?? <>{children}</> ?? null;

  return <View style={styles.container}>
    <ActivityIndicator style={styles.loading} color={styles.loading.color} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    justifyContent: "center",
    paddingVertical: 5,
  },
  loading: {
    alignSelf: "center",
    color: lightColors.text,
    paddingVertical: 4,
  },
});

export default ShowWhenLoaded;
