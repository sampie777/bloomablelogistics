import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ProductExtra } from "../../../../logic/models";
import { lightColors } from "../../../theme";

interface Props {
  item: ProductExtra;
}

const ProductExtraComponent: React.FC<Props> = ({ item }) => {
  const [enlargeImage, setEnlargeImage] = useState(false);

  const toggleImage = () => {
    setEnlargeImage(!enlargeImage);
  };

  return <View style={[styles.container, (!enlargeImage ? {} : styles.containerImageEnlarged)]}>
    <View style={styles.left}>
      {item.image === undefined ? undefined :
        <TouchableOpacity onPress={toggleImage}>
          <Image source={{ uri: item.image }}
                 resizeMode={"contain"}
                 style={[styles.image, (!enlargeImage ? {} : styles.imageEnlarged)]} />
        </TouchableOpacity>}
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
  containerImageEnlarged: {
    flexDirection: "column",
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
  imageEnlarged: {
    height: 400,
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
