import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Location } from "../../logic/location/Locations";

interface Props {
  locations: Location[];
}

const Map: React.FC<Props> = ({ locations }) => {
  const mapRef = useRef<MapView | null>();

  useEffect(() => {
    fitMap();
  }, [locations]);

  const fitMap = () => {
    if (locations.length === 0) {
      return;
    }

    mapRef.current?.fitToSuppliedMarkers(
      locations.map(it => it.key),
      {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
      });
  };

  return <View style={styles.container}>
    <MapView style={{ flex: 1 }}
             ref={ref => mapRef.current = ref}
             showsUserLocation={true}
             initialRegion={{
               latitude: -25.763144,
               longitude: 28.1,
               latitudeDelta: 0.4,
               longitudeDelta: 0.3,
             }}
             userLocationPriority={"balanced"}>
      {locations.map(it =>
        <Marker key={it.key}
                coordinate={{ ...it }}
                identifier={it.key}
                title={it.order.number?.toString()}
                description={it.order.recipient?.address || it.order.recipient?.name} />)}
    </MapView>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Map;
