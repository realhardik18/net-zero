import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Alert, ScrollView } from 'react-native';

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
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

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
          timeInterval: 500,
          distanceInterval: 0.1,
        },
        (loc) => {
          setLocation(loc);
          setLastUpdateTime(new Date());
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
    return distance <= 100; // 10 meter radius
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

  // Auto-fetch map data when location is available with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (location && !isLoading) {
        fetchMapData();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [location]);

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(2)} km`;
    }
    return `${distance.toFixed(1)} m`;
  };

  const getLocationStatus = () => {
    if (!location) return { color: '#6c757d', text: 'Getting location...' };
    if (lastUpdateTime) {
      const timeDiff = Date.now() - lastUpdateTime.getTime();
      if (timeDiff < 2000) return { color: '#28a745', text: 'Live' };
      if (timeDiff < 10000) return { color: '#ffc107', text: 'Recent' };
    }
    return { color: '#dc3545', text: 'Outdated' };
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome To net0</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.locationCard}>
        <ThemedView style={styles.locationHeader}>
          <ThemedText type="subtitle">📍 Your Location</ThemedText>
          {location && (
            <ThemedView style={[styles.statusIndicator, { backgroundColor: getLocationStatus().color }]}>
              <ThemedText style={styles.statusText}>{getLocationStatus().text}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        
        {errorMsg && <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>}
        
        {!location && !errorMsg && (
          <ThemedView style={styles.loadingLocationContainer}>
            <ActivityIndicator size="small" color="#0a84ff" />
            <ThemedText style={styles.loadingText}>Acquiring GPS signal...</ThemedText>
          </ThemedView>
        )}
        
        {location && (
          <ThemedView>
            <ThemedView style={styles.coordinatesContainer}>
              <ThemedText style={styles.coordinateLabel}>Lat:</ThemedText>
              <ThemedText style={styles.coordinateValue}>{location.coords.latitude.toFixed(6)}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.coordinatesContainer}>
              <ThemedText style={styles.coordinateLabel}>Lng:</ThemedText>
              <ThemedText style={styles.coordinateValue}>{location.coords.longitude.toFixed(6)}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.accuracyText}>
              Accuracy: ±{location.coords.accuracy?.toFixed(1)}m
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Event Status */}
      {location && (
        <ThemedView style={styles.eventStatusContainer}>
          {isLoading ? (
            <ThemedView style={styles.loadingEventContainer}>
              <ActivityIndicator size="large" color="#0a84ff" />
              <ThemedText style={styles.loadingEventText}>Scanning for events...</ThemedText>
              <ThemedView style={styles.scanningIndicator}>
                <ThemedText style={styles.scanningText}>🔍 Analyzing your location</ThemedText>
              </ThemedView>
            </ThemedView>
          ) : mapData ? (
            <>
              {isWithinRadius && mapData.event_info ? (
                <ThemedView style={styles.eventFoundContainer}>
                  <ThemedView style={styles.eventHeader}>
                    <ThemedText style={styles.eventFoundTitle}>🎉 Event Detected!</ThemedText>
                    <ThemedView style={styles.liveIndicator}>
                      <ThemedText style={styles.liveText}>LIVE</ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={styles.eventCard}>
                    <ThemedText style={styles.eventName}>{mapData.event_info.name}</ThemedText>
                    <ThemedText style={styles.eventId}>#{mapData.event_info.id}</ThemedText>
                    
                    <ThemedView style={styles.divider} />
                    
                    <ThemedText style={styles.guestLabel}>👥 Attendees</ThemedText>
                    <ThemedView style={styles.guestGrid}>
                      {mapData.event_info.guests && mapData.event_info.guests.map((guest: string, index: number) => (
                        <ThemedView key={index} style={styles.guestChip}>
                          <ThemedText style={styles.guestChipText}>{guest}</ThemedText>
                        </ThemedView>
                      ))}
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              ) : (
                <ThemedView style={styles.noEventContainer}>
                  <ThemedText style={styles.noEventIcon}>📡</ThemedText>
                  <ThemedText style={styles.noEventTitle}>No Events Nearby</ThemedText>
                  <ThemedText style={styles.noEventSubtitle}>
                    Move closer to an event location to join
                  </ThemedText>
                  {currentDistance !== null && (
                    <ThemedView style={styles.distanceChip}>
                      <ThemedText style={styles.distanceChipText}>
                        📍 {formatDistance(currentDistance)} to nearest event
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              )}
            </>
          ) : null}
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 50,
    marginBottom: 30,
  },
  locationCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    color: '#888',
    fontSize: 14,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  coordinateLabel: {
    fontWeight: 'bold',
    color: '#ccc',
  },
  coordinateValue: {
    fontFamily: 'monospace',
    color: '#0a84ff',
    fontWeight: '600',
  },
  accuracyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  eventStatusContainer: {
    marginBottom: 20,
  },
  loadingEventContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  loadingEventText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scanningIndicator: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a2332',
    borderRadius: 20,
  },
  scanningText: {
    color: '#4a9eff',
    fontSize: 14,
  },
  eventFoundContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  eventHeader: {
    backgroundColor: '#2d5a2d',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventFoundTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  liveIndicator: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventCard: {
    padding: 20,
  },
  eventName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 4,
  },
  eventId: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  guestLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 12,
  },
  guestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  guestChip: {
    backgroundColor: '#2d5a2d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4caf50',
  },
  guestChipText: {
    color: '#a8e6a8',
    fontWeight: '600',
  },
  noEventContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  noEventIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noEventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  noEventSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  distanceChip: {
    backgroundColor: '#332d1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  distanceChipText: {
    color: '#ffcc02',
    fontWeight: '600',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
