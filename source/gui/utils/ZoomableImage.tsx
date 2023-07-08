import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { lightColors } from "../theme";

interface Props {
  url: string;
  minHeight?: number;
  onSizeChange?: (enlarged: boolean) => void;
}

const ZoomableImage: React.FC<Props> = ({ url, minHeight = 200, onSizeChange }) => {
  const [enlargeImage, setEnlargeImage] = useState(false);
  const [imageAvailable, setImageAvailable] = useState(true);

  const toggleImage = () => {
    if (!imageAvailable) setEnlargeImage(false);
    setEnlargeImage(!enlargeImage);
  };

  useEffect(() => {
    onSizeChange?.(enlargeImage);
  }, [enlargeImage]);

  return <TouchableOpacity onPress={toggleImage} disabled={!imageAvailable}>
    <Image source={{ uri: url }}
           resizeMode={"contain"}
           onError={() => setImageAvailable(false)}
           onLoad={() => setImageAvailable(true)}
           style={[styles.image,
             { height: minHeight },
             (!enlargeImage ? {} : styles.imageEnlarged),
             (imageAvailable ? {} : styles.unavailableImage),
           ]} />
    {imageAvailable ? undefined : <Text style={styles.imageErrorText}>Image not available</Text>}
  </TouchableOpacity>;
};

const styles = StyleSheet.create({
  image: {
    resizeMode: "contain",
    marginBottom: 15,
  },
  imageEnlarged: {
    height: 400,
  },
  unavailableImage: {
    height: 0,
    marginBottom: 0,
  },
  imageErrorText: {
    fontSize: 12,
    color: lightColors.textLighter,
    textAlign: "center",
    marginBottom: 15,
  },
});

export default ZoomableImage;
