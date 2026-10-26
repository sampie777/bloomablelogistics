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
import SmartAddressButton from "./SmartAddressButton";
import { settings } from "../../logic/settings/settings";

interface Props {}

const MapOverview: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const isDirty = useRef(false);
  const orders = useRecoilValue(selectedDateOrdersState);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useSmartAddress, setUseSmartAddress] = useState(true);

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
  }, [orders, useSmartAddress, settings.useInitialCoordinatesForOrders]);

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => subscription.remove();
    }, [selectedLocation]),
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

    if (orders.length === 0) {
      setLocations([]);
      setSelectedLocation(undefined);
      setIsProcessing(false);
      return;
    }

    if (locations.length === 0) {
      setIsProcessing(true);
    }

    Locations.locationsForOrders(orders, useSmartAddress)
      .then((result) => {
        setLocations(result);
        setSelectedLocation((current) => {
          if (!current) return undefined;
          const match = result.find(loc =>
            loc.orders.some(o =>
              current.orders.some(co => co.id != null && co.id === o.id)
            )
          );
          return match;
        });
      })
      .finally(() => setIsProcessing(false));
  };

  const onMarkerPress = (location: Location | undefined) => {
    setSelectedLocation(location);
  };

  const toggleSmartAddress = () => {
    setUseSmartAddress(!useSmartAddress);
  };

  return <View style={styles.container}>
    <Map locations={locations} onMarkerPress={onMarkerPress} />
    {settings.useInitialCoordinatesForOrders ? undefined :
      <SmartAddressButton enabled={useSmartAddress} onPress={toggleSmartAddress} />}
    {selectedLocation === undefined ? undefined :
      <SelectedLocationOverlay location={selectedLocation}
                               unselectLocation={() => onMarkerPress(undefined)} />}
    <LoadingOverlay isVisible={isProcessing} opacity={0.1} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightColors.background,
  },
});

export default MapOverview;
