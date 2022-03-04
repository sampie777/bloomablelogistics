import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Order } from "../../logic/models";

interface Props {
  orders: Order[];
}

const Map: React.FC<Props> = ({ orders }) => {
  const mapRef = useRef<MapView | null>();

  useEffect(() => {
    setTimeout(() => fitMap(), 1000);
  }, []);

  useEffect(() => {
    fitMap();
  }, [orders]);

  const fitMap = () => {
    mapRef.current?.fitToSuppliedMarkers(
      orders.map(order => order.number?.toString() || ""),
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
      {orders
        .filter(it => it.recipient?.location)
        .map(it =>
          <Marker key={it.number?.toString()}
                  coordinate={it.recipient!.location!}
                  identifier={it.number?.toString() || ""}
                  title={it.number?.toString()}
                  description={it.recipient?.address || it.recipient?.name} />)}
    </MapView>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Map;
