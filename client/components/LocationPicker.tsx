"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Check, X } from 'lucide-react';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  onLocationSelect: (locationId: string) => void;
  selectedLocationId: string;
  apiCredentials: { email: string; password: string } | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  selectedLocationId,  
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [newLocation, setNewLocation] = useState({ lat: '', lng: '', name: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const API = "http://localhost:8000";

  // Fetch existing locations
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${API}/locations`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    }
  };

  // Create new location
  const handleCreateLocation = async () => {
    if (!newLocation.lat || !newLocation.lng) {
      setError('Please enter valid coordinates');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const response = await fetch(`${API}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          latitude: newLocation.lat,
          longitude: newLocation.lng
        })
      });

      if (response.ok) {
        const createdLocation = await response.json();
        setLocations(prev => [...prev, createdLocation]);
        onLocationSelect(createdLocation.id);
        setNewLocation({ lat: '', lng: '', name: '' });
        setShowMap(false);
      } else {
        throw new Error('Failed to create location');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewLocation({
          ...newLocation,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        });
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (error) => {
        setError('Unable to get your location');
      }
    );
  };

  // Handle map click (simplified - in real app you'd integrate with a map library)
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (simplified)
    const lat = (90 - (y / rect.height) * 180).toFixed(6);
    const lng = ((x / rect.width) * 360 - 180).toFixed(6);
    
    setNewLocation({
      ...newLocation,
      lat: lat,
      lng: lng
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        
        {/* Existing locations dropdown */}
        <select
          value={selectedLocationId}
          onChange={(e) => onLocationSelect(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none mb-2"
        >
          <option value="">Select an existing location</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
            </option>
          ))}
        </select>

        {/* Add new location button */}
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
        >
          <Plus size={16} />
          Add new location
        </button>
      </div>

      {/* Location picker modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Location</h3>
              <button
                onClick={() => {
                  setShowMap(false);
                  setError('');
                  setNewLocation({ lat: '', lng: '', name: '' });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Manual coordinate input */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newLocation.lat}
                    onChange={(e) => setNewLocation({...newLocation, lat: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. 40.7128"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newLocation.lng}
                    onChange={(e) => setNewLocation({...newLocation, lng: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                    placeholder="e.g. -74.0060"
                  />
                </div>
              </div>

              {/* Get current location button */}
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 rounded-lg px-3 py-2 hover:bg-blue-100"
              >
                <MapPin size={16} />
                Use my current location
              </button>

              {/* Simplified map visualization */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-100 p-2 text-sm text-gray-600 text-center">
                  Click on the map to select coordinates
                </div>
                <div
                  className="w-full h-48 bg-gradient-to-br from-green-200 to-blue-200 cursor-crosshair relative"
                  onClick={handleMapClick}
                >
                  {newLocation.lat && newLocation.lng && (
                    <div
                      className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-2 -translate-y-2"
                      style={{
                        left: `${((parseFloat(newLocation.lng) + 180) / 360) * 100}%`,
                        top: `${((90 - parseFloat(newLocation.lat)) / 180) * 100}%`
                      }}
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                    {newLocation.lat && newLocation.lng ? 
                      `${parseFloat(newLocation.lat).toFixed(4)}, ${parseFloat(newLocation.lng).toFixed(4)}` :
                      'Click to select'
                    }
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMap(false);
                    setError('');
                    setNewLocation({ lat: '', lng: '', name: '' });
                  }}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateLocation}
                  disabled={creating || !newLocation.lat || !newLocation.lng}
                  className="flex-1 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    'Creating...'
                  ) : (
                    <>
                      <Check size={16} />
                      Add Location
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;