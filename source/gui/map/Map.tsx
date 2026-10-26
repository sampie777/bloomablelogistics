import React, { useEffect, useRef, useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Permissions } from "../../logic/permissions";
import MapView, { Marker } from "react-native-maps";
import { Location, Locations } from "../../logic/location/Locations";

interface Props {
  locations: Location[];
  onMarkerPress?: (location: Location | undefined) => void;
}

const Map: React.FC<Props> = ({ locations, onMarkerPress }) => {
  const mapRef = useRef<MapView | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    requestLocationPermission();
    fitMap();
  }, [locations]);

  const requestLocationPermission = () => {
    if (Platform.OS !== "android") {
      return;
    }

    Permissions.askPermission(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      .then(isGranted => setHasLocationPermission(isGranted));
  };

  const fitMap = () => {
    if (locations.length === 0) {
      return;
    }

    setTimeout(() => mapRef.current?.fitToSuppliedMarkers(
      locations.map(it => it.key),
      {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
      }), 500);
  };

  return <View style={styles.container}>
    <MapView style={{ flex: 1 }}
             ref={mapRef}
             showsUserLocation={hasLocationPermission}
             moveOnMarkerPress={false}
             maxZoomLevel={19}
             initialRegion={{
               latitude: -25.763144,
               longitude: 28.1,
               latitudeDelta: 0.4,
               longitudeDelta: 0.3,
             }}
             userLocationPriority={"balanced"}>
      {[...locations].reverse().map(it => {
        const isDelivered = Locations.allOrdersDelivered(it);
        const orderCount = it.orders.length;

        return (
          <Marker
            key={it.key}
            coordinate={{ ...it }}
            identifier={it.key}
            anchor={{ x: 0.5, y: 1.0 }}
            stopPropagation={true}
            onPress={() => onMarkerPress?.(it)}>
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.markerPill,
                  isDelivered ? styles.markerDelivered : styles.markerPending,
                ]}>
                <Text style={styles.markerText}>{orderCount}</Text>
              </View>
              <View
                style={[
                  styles.markerArrow,
                  isDelivered
                    ? styles.markerArrowDelivered
                    : styles.markerArrowPending,
                ]}
              />
            </View>
          </Marker>
        );
      })}
    </MapView>
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
  },
  markerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  markerDelivered: {
    backgroundColor: "#00c900",
  },
  markerPending: {
    backgroundColor: "#e53935",
  },
  markerText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    alignSelf: "center",
  },
  markerArrowDelivered: {
    borderTopColor: "#00c900",
  },
  markerArrowPending: {
    borderTopColor: "#e53935",
  },
});

export default Map;
