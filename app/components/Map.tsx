import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapProps {
  location: Location.LocationObject | null;
}

export function Map({ location }: MapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (location && mapRef.current) {
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      mapRef.current.animateToRegion(region, 1000);
    }
  }, [location]);

  if (!location) {
    return <View style={styles.container} />;
  }

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }}
      showsUserLocation={true}
      followsUserLocation={true}
      showsMyLocationButton={true}
      mapType="standard"
      loadingEnabled={true}
      moveOnMarkerPress={false}
    >
      <Marker
        coordinate={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }}
        title="Your Location"
        description={`Accuracy: ${location.coords.accuracy?.toFixed(1)}m`}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  map: {
    height: 300,
  },
});
