import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRecoilValue } from "recoil";
import { selectedDateOrdersState } from "../../logic/recoil";
import { Location, Locations } from "../../logic/location/Locations";
import Map from "./Map";

interface Props {

}

const MapOverview: React.FC<Props> = () => {
  const orders = useRecoilValue(selectedDateOrdersState);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    Locations.locationsForOrders(orders)
      .then((result) => setLocations(result));
  }, [orders]);

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
