import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { ProductExtra } from "../../../../logic/models";
import { lightColors } from "../../../theme";

interface Props {
  item: ProductExtra;
}

const ProductExtraComponent: React.FC<Props> = ({ item }) => {
  return <View style={styles.container}>
    <View style={styles.left}>
      {item.image === undefined ? undefined : <Image source={{ uri: item.image }} style={styles.image} />}
    </View>

    <View style={styles.right}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    marginTop: 20,
  },

  left: {
    flex: 1,
  },
  right: {
    paddingTop: 20,
    paddingHorizontal: 15,
  },

  image: {
    resizeMode: "contain",
    height: 150,
    marginBottom: 15,
  },
  name: {
    fontWeight: "bold",
    color: lightColors.text,
  },
  description: {
    color: lightColors.text,
  },
});

export default ProductExtraComponent;
