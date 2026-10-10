import React, { useState } from "react";
import { Image, StyleSheet, Text } from "react-native";
import { lightColors } from "../theme";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  url: string;
  minHeight?: number;
  onSizeChange?: (enlarged: boolean) => void;
}

const ZoomableImage: React.FC<Props> = ({ url, minHeight = 200 }) => {
  const [imageAvailable, setImageAvailable] = useState(true);

  // Layout dimensions of the image container to compute the focal point relative to center
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const scale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const zIndex = useSharedValue(1);

  const resetZoom = () => {
    "worklet";
    scale.value = withTiming(1, { duration: 200 });
    focalX.value = withTiming(0, { duration: 200 });
    focalY.value = withTiming(0, { duration: 200 });
    translateX.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(0, { duration: 200 });
    zIndex.value = 1;
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(e => {
      "worklet";
      zIndex.value = 9999;
      // Focal point relative to the center of the image
      focalX.value = e.focalX - width.value / 2;
      focalY.value = e.focalY - height.value / 2;
    })
    .onUpdate(e => {
      "worklet";
      scale.value = Math.max(1, Math.min(e.scale, 5));
    })
    .onEnd(() => {
      "worklet";
      // The moment the user lets go of the pinch, reset back to original position and size
      resetZoom();
    });

  const panGesture = Gesture.Pan()
    .minPointers(2) // Only pan simultaneously during 2-finger gesture
    .onUpdate(e => {
      "worklet";
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      "worklet";
      resetZoom();
    });

  const composedGestures = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    zIndex: zIndex.value,
    elevation: zIndex.value > 1 ? 9999 : 0,
  }));

  const animatedImageStyle = useAnimatedStyle(() => {
    // Zoom around the focal point:
    // T_focal * S * T_-focal = Translate by (1 - scale) * focal + pan translation
    const currentScale = scale.value;
    const currentTx = translateX.value + (1 - currentScale) * focalX.value;
    const currentTy = translateY.value + (1 - currentScale) * focalY.value;

    return {
      transform: [
        { translateX: currentTx },
        { translateY: currentTy },
        { scale: currentScale },
      ],
    };
  });

  if (!imageAvailable) {
    return <Text style={styles.imageErrorText}>Image not available</Text>;
  }

  return (
    <Animated.View
      style={[styles.container, { minHeight }, animatedContainerStyle]}
      onLayout={e => {
        width.value = e.nativeEvent.layout.width;
        height.value = e.nativeEvent.layout.height;
      }}
    >
      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[styles.imageWrapper, animatedImageStyle]}>
          <Image
            source={{ uri: url }}
            resizeMode={"contain"}
            onError={() => setImageAvailable(false)}
            onLoad={() => setImageAvailable(true)}
            style={[styles.image, { height: minHeight }]}
          />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    resizeMode: "contain",
  },
  imageErrorText: {
    fontSize: 12,
    color: lightColors.textLighter,
    textAlign: "center",
    marginBottom: 15,
  },
});

export default ZoomableImage;
