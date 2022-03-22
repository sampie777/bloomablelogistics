import React, { useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { Location, Locations } from "../../logic/location/Locations";
import Map from "./Map";
import { useFocusEffect } from "@react-navigation/native";
import LoadingOverlay from "../utils/LoadingOverlay";
import SelectedLocationOverlay from "./SelectedLocationOverlay";
import { lightColors } from "../theme";

interface Props {

}

const MapOverview: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const isDirty = useRef(false);
  const orders = useRecoilValue(selectedDateOrdersState);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(React.useCallback(() => {
    isMounted.current = true;

    if (isDirty.current) {
      loadLocations();
    }
    return () => {
      isMounted.current = false;
    };
  }, [orders]));

  useEffect(() => {
    if (!isMounted.current) {
      isDirty.current = true;
      return;
    }
    loadLocations();
  }, [orders]);

  useFocusEffect(
    React.useCallback(() => {
      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [selectedLocation])
  );

  const onBackPress = (): boolean => {
    if (selectedLocation !== undefined) {
      setSelectedLocation(undefined);
      return true;
    }

    return false;
  };

  const loadLocations = () => {
    isDirty.current = false;
    setSelectedLocation(undefined);

    if (orders.length === 0) {
      setLocations([]);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    Locations.locationsForOrders(orders)
      .then((result) => setLocations(result))
      .finally(() => setIsProcessing(false));
  };

  const onMarkerPress = (location: Location | undefined) => {
    setSelectedLocation(location);
  };

  return <View style={styles.container}>
    <Map locations={locations} onMarkerPress={onMarkerPress} />
    <LoadingOverlay isVisible={isProcessing} opacity={0.1} />
    {selectedLocation === undefined ? undefined :
      <SelectedLocationOverlay location={selectedLocation}
                               unselectLocation={() => onMarkerPress(undefined)} />}
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
});

export default MapOverview;
