import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { Location, Locations } from "../../logic/location/Locations";
import Map from "./Map";
import { useFocusEffect } from "@react-navigation/native";
import LoadingOverlay from "../utils/LoadingOverlay";

interface Props {

}

const MapOverview: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const isDirty = useRef(false);
  const orders = useRecoilValue(selectedDateOrdersState);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useFocusEffect(React.useCallback(() => {
    isMounted.current = true;

    if (isDirty.current) {
      loadLocations();
    }
    return () => {
      isMounted.current = false;
    };
  }, []));

  useEffect(() => {
    if (!isMounted.current) {
      isDirty.current = true;
      return;
    }
    loadLocations();
  }, [orders]);

  const loadLocations = () => {
    isDirty.current = false;

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

  return <View style={styles.container}>
    <Map locations={locations} />
    <LoadingOverlay isVisible={isProcessing} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapOverview;
