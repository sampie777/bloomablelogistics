import React from "react";
import { StyleSheet, View } from "react-native";
import { Product } from "../../../../logic/models";
import ProductComponent from "./ProductComponent";

interface Props {
  products?: Product[];
}

const Products: React.FC<Props> = ({ products }) => {
  if (products === undefined) {
    return null;
  }

  return <View style={styles.container}>
    {products.map((it, i) => <ProductComponent key={(it.image || i.toString()) + (it.retailPrice || "")}
                                               product={it} />)}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Products;
