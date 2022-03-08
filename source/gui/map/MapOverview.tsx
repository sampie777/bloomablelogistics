import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { Location, Locations } from "../../logic/location/Locations";
import Map from "./Map";
import { useFocusEffect } from "@react-navigation/native";

interface Props {

}

const MapOverview: React.FC<Props> = () => {
  const isMounted = useRef(false);
  const isDirty = useRef(false);
  const orders = useRecoilValue(selectedDateOrdersState);
  const [locations, setLocations] = useState<Location[]>([]);

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
    Locations.locationsForOrders(orders)
      .then((result) => setLocations(result));
  };

  return <View style={styles.container}>
    <Map locations={locations} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MapOverview;
