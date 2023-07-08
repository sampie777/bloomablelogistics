import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Product } from "../../../../logic/orders/models";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import { lightColors } from "../../../theme";
import ProductExtraComponent from "./ProductExtraComponent";
import { htmlToString } from "../../../../logic/utils";
import ZoomableImage from "../../../utils/ZoomableImage";
import ShowWhenLoaded from "./ShowWhenLoaded";

interface Props {
  product: Product;
}

const ProductComponent: React.FC<Props> = ({ product }) => {
  const description = htmlToString(product.description ?? "");
  return <View style={styles.container}>
    {product.image === undefined || !product._detailsLoaded ? undefined : <ZoomableImage url={product.image} />}

    <View style={styles.row}>
      <Text style={styles.name}>{product.name}</Text>
      {product.quantity === undefined ? undefined : <Text style={styles.quantity}> x {product.quantity}</Text>}
    </View>

    <View style={styles.row}>
      {!product._detailsLoaded ? <Text style={styles.size} /> :
        <>
          <FontAwesome5Icon name={"expand"} style={styles.icon} />
          <Text style={styles.size}>{product.size}</Text>
        </>
      }

      {product.retailPrice === undefined ? undefined :
        <Text style={styles.retailPrice}>R {product.retailPrice.toFixed(2)}</Text>}
    </View>

    <ShowWhenLoaded product={product}>
      {!product.guidelines ? undefined : <View style={styles.row}>
        <FontAwesome5Icon name={"comment-alt"} style={styles.icon} />
        <Text style={styles.guidelines}>{product.guidelines}</Text>
      </View>}

      {description.length === 0 ? undefined : <View style={styles.row}>
        <FontAwesome5Icon name={"comment"} style={styles.icon} />
        <Text style={styles.description}>{description}</Text>
      </View>}

      {product.extras?.map((it, index) =>
        <ProductExtraComponent item={it} key={index + (it.name || "")} />)}
    </ShowWhenLoaded>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: lightColors.border,
    paddingVertical: 20,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 10,
    minWidth: 16,
    color: lightColors.text,
  },

  name: {
    fontWeight: "bold",
    flex: 1,
    color: lightColors.text,
  },
  size: {
    flex: 1,
    color: lightColors.text,
  },
  quantity: {
    color: lightColors.text,
  },
  retailPrice: {
    color: lightColors.text,
  },
  guidelines: {
    borderLeftWidth: 1,
    borderLeftColor: lightColors.border,
    marginVertical: 8,
    paddingHorizontal: 10,
    fontStyle: "italic",
    color: lightColors.text,
  },
  description: {
    borderLeftWidth: 1,
    borderLeftColor: lightColors.border,
    marginVertical: 8,
    paddingHorizontal: 10,
    fontStyle: "italic",
    color: lightColors.text,
  },
});

export default ProductComponent;
