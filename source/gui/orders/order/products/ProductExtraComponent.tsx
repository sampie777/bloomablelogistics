import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ProductExtra } from "../../../../logic/orders/models";
import { lightColors } from "../../../theme";
import ZoomableImage from "../../../utils/ZoomableImage";

interface Props {
  item: ProductExtra;
}

const ProductExtraComponent: React.FC<Props> = ({ item }) => {
  const [enlargeImage, setEnlargeImage] = useState(false);

  return <View style={[styles.container, (!enlargeImage ? {} : styles.containerImageEnlarged)]}>
    <View style={styles.left}>
      {item.image === undefined ? undefined :
        <ZoomableImage url={item.image}
                       minHeight={150}
                       onSizeChange={setEnlargeImage} />}
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

  name: {
    fontWeight: "bold",
    color: lightColors.text,
  },
  description: {
    color: lightColors.text,
  },
});

export default ProductExtraComponent;
