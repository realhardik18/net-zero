import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWithinRadius, setIsWithinRadius] = useState<boolean | null>(null);
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000, // Update every second
          distanceInterval: 0.5, // Update every meter
        },
        (loc) => {
          setLocation(loc);
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Function to check if user is within 10m radius
  const checkRadius = (userLat: number, userLon: number, targetLat: number, targetLon: number): boolean => {
    const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
    return distance <= 10; // 10 meter radius
  };

  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('https://a99c70ce1d00.ngrok-free.app/maps', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMapData(data);

      // Check if user is within radius when both location and map data are available
      if (location && data.lat && data.long) {
        const withinRadius = checkRadius(
          location.coords.latitude,
          location.coords.longitude,
          data.lat,
          data.long
        );
        setIsWithinRadius(withinRadius);
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch map data';
      
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        errorMessage = 'Network error: Please ensure the server is running on http://127.0.0.1:5000/ and accessible from your device';
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Connection Error', errorMessage);
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update radius check whenever location or mapData changes
  useEffect(() => {
    if (location && mapData && mapData.lat && mapData.long) {
      const distance = calculateDistance(
        location.coords.latitude,
        location.coords.longitude,
        mapData.lat,
        mapData.long
      );
      const withinRadius = distance <= 10;
      setIsWithinRadius(withinRadius);
      setCurrentDistance(distance);
    }
  }, [location, mapData]);

  // Auto-fetch map data when location is available
  useEffect(() => {
    if (location && !mapData && !isLoading) {
      fetchMapData();
    }
  }, [location]);

  // Format distance for display
  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${distance.toFixed(1)} m`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome To net0</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">📍 Your Location</ThemedText>
        {errorMsg && <ThemedText>{errorMsg}</ThemedText>}
        {!location && !errorMsg && <ActivityIndicator size="small" />}
        {location && (
          <>
            <ThemedText>Latitude: {location.coords.latitude.toFixed(6)}</ThemedText>
            <ThemedText>Longitude: {location.coords.longitude.toFixed(6)}</ThemedText>
          </>
        )}
      </ThemedView>

      {/* Show event status */}
      {location && (
        <ThemedView style={styles.stepContainer}>
          {isLoading ? (
            <ThemedView style={styles.loadingContainer}>
              <ActivityIndicator size="small" />
              <ThemedText>Checking for nearby events...</ThemedText>
            </ThemedView>
          ) : mapData ? (
            <>
              {isWithinRadius && mapData.event_info ? (
                <ThemedView style={styles.eventContainer}>
                  <ThemedText type="subtitle">🎉 You're at an Event!</ThemedText>
                  <ThemedView style={styles.eventDetails}>
                    <ThemedText style={styles.eventName}>Event: {mapData.event_info.name}</ThemedText>
                    <ThemedText style={styles.eventId}>ID: {mapData.event_info.id}</ThemedText>
                    
                    <ThemedText style={styles.guestLabel}>Guests:</ThemedText>
                    {mapData.event_info.guests && mapData.event_info.guests.map((guest: string, index: number) => (
                      <ThemedText key={index} style={styles.guestName}>• {guest}</ThemedText>
                    ))}
                  </ThemedView>
                </ThemedView>
              ) : (
                <ThemedView style={styles.noEventContainer}>
                  <ThemedText style={styles.noEventText}>📍 No events in your area right now</ThemedText>
                  {currentDistance !== null && (
                    <ThemedText style={styles.distanceInfo}>
                      Nearest event is {formatDistance(currentDistance)} away
                    </ThemedText>
                  )}
                </ThemedView>
              )}
            </>
          ) : null}
        </ThemedView>
      )}

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current <ThemedText type="defaultSemiBold">app</ThemedText> to <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 40,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  noEventContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    alignItems: 'center',
  },
  noEventText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    textAlign: 'center',
  },
  distanceInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
    textAlign: 'center',
  },
  distanceDisplay: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#b0d4f1',
    alignItems: 'center',
  },
  distanceLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 14,
  },
  distanceValue: {
    fontSize: 20,
    color: '#0066cc',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  distanceSubtext: {
    fontSize: 12,
    color: '#666',
  },
  radiusContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  insideRadius: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  outsideRadius: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  radiusText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  distanceText: {
    textAlign: 'center',
    marginTop: 4,
    fontSize: 12,
  },
  eventContainer: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  eventDetails: {
    marginTop: 8,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  eventId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  guestLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2e7d32',
  },
  guestName: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
    color: '#555',
  },
});

