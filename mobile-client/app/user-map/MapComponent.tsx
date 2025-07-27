"use client"

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapComponentProps {
  userLocation: {lat: number, lng: number} | null
  eventLocation: {lat: number, lng: number}
  distance: number | null
}

export default function MapComponent({ userLocation, eventLocation, distance }: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null)
  const userMarkerRef = useRef<L.Marker | null>(null)
  const eventMarkerRef = useRef<L.Marker | null>(null)
  const lineRef = useRef<L.Polyline | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const mapInitialized = useRef(false)
  const mapFitted = useRef(false)

  useEffect(() => {
    if (!mapInitialized.current) {
      // Initialize map with mobile-optimized settings
      const map = L.map('map', {
        center: [eventLocation.lat, eventLocation.lng],
        zoom: 15,
        zoomControl: false, // Disable default zoom control for cleaner mobile UI
        attributionControl: false, // Remove attribution for more space
        preferCanvas: true, // Use canvas renderer for better mobile performance
        zoomSnap: 0.5, // Allow half-step zooming for better mobile experience
        wheelPxPerZoomLevel: 120, // Optimize scroll wheel sensitivity
        maxBoundsViscosity: 0.5, // Smooth boundary handling
        // tap: true, // Enable tap handling on mobile (removed, not a valid MapOptions property)
        tapTolerance: 15, // Increase tap tolerance for touch devices
        bounceAtZoomLimits: false, // Disable bounce for smoother experience
      })

      // Add lightweight tile layer optimized for mobile
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '',
        subdomains: 'abcd',
        maxZoom: 18, // Reduce max zoom to prevent excessive detail
        minZoom: 10, // Set minimum zoom to prevent too much data
        tileSize: 256,
        updateWhenZooming: false, // Prevent updates during zoom for smoother performance
        updateWhenIdle: true, // Only update when map is idle
        keepBuffer: 2, // Reduce tile buffer for memory efficiency
      }).addTo(map)

      // Add custom zoom control in better position for mobile
      L.control.zoom({
        position: 'bottomright'
      }).addTo(map)

      mapRef.current = map
      mapInitialized.current = true

      // Add event marker with simplified icon for mobile
      const eventIcon = L.divIcon({
        className: 'custom-event-marker',
        html: `<div style="
          width: 28px; 
          height: 28px; 
          background: #ef4444; 
          border: 2px solid white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <div style="
            width: 6px; 
            height: 6px; 
            background: white; 
            border-radius: 50%;
          "></div>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      })

      eventMarkerRef.current = L.marker([eventLocation.lat, eventLocation.lng], { icon: eventIcon })
        .bindPopup(`
          <div style="color: black; font-weight: bold; font-size: 14px;">Event Location</div>
          <div style="color: #666; font-size: 12px;">WeWork Downtown SF</div>
        `, {
          closeButton: false,
          offset: [0, -10],
          className: 'mobile-popup'
        })
        .addTo(map)

      // Add smaller radius circle for mobile
      circleRef.current = L.circle([eventLocation.lat, eventLocation.lng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.08,
        radius: 500, // Smaller radius for mobile view
        weight: 1.5,
        opacity: 0.4
      }).addTo(map)
    }

    // Update user marker with mobile optimizations
    if (userLocation && mapRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
      } else {
        // Simplified user icon for mobile
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div style="
            width: 18px; 
            height: 18px; 
            background: #3b82f6; 
            border: 2px solid white; 
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              position: absolute;
              top: -4px;
              left: -4px;
              width: 26px;
              height: 26px;
              border: 1px solid #3b82f6;
              border-radius: 50%;
              animation: mobilePulse 2s infinite;
              opacity: 0.3;
            "></div>
          </div>
          <style>
            @keyframes mobilePulse {
              0% { transform: scale(0.8); opacity: 0.3; }
              50% { transform: scale(1.1); opacity: 0.1; }
              100% { transform: scale(1.3); opacity: 0; }
            }
          </style>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9]
        })

        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .bindPopup(`
            <div style="color: black; font-weight: bold; font-size: 14px;">Your Location</div>
            <div style="color: #666; font-size: 12px;">
              ${distance ? `${distance.toFixed(2)} km from event` : 'Calculating distance...'}
            </div>
          `, {
            closeButton: false,
            offset: [0, -10],
            className: 'mobile-popup'
          })
          .addTo(mapRef.current)
      }

      // Update line with mobile optimization
      if (lineRef.current) {
        lineRef.current.setLatLngs([
          [userLocation.lat, userLocation.lng],
          [eventLocation.lat, eventLocation.lng]
        ])
      } else {
        lineRef.current = L.polyline([
          [userLocation.lat, userLocation.lng],
          [eventLocation.lat, eventLocation.lng]
        ], {
          color: '#3b82f6',
          weight: 2,
          opacity: 0.6,
          dashArray: '8, 8',
          smoothFactor: 2 // Smooth the line for better mobile performance
        }).addTo(mapRef.current)
      }

      // Update popup with new distance
      if (distance !== null && userMarkerRef.current) {
        userMarkerRef.current.getPopup()?.setContent(`
          <div style="color: black; font-weight: bold; font-size: 14px;">Your Location</div>
          <div style="color: #666; font-size: 12px;">${distance.toFixed(2)} km from event</div>
        `)
      }

      // Fit map with mobile-friendly bounds and padding
      if (userMarkerRef.current && eventMarkerRef.current && !mapFitted.current) {
        const group = L.featureGroup([userMarkerRef.current, eventMarkerRef.current])
        mapRef.current.fitBounds(group.getBounds(), {
          padding: [20, 20], // Smaller padding for mobile
          maxZoom: 16 // Prevent zooming too close on mobile
        })
        mapFitted.current = true
      }
    }

    // Cleanup function
    return () => {
      if (mapRef.current && !mapInitialized.current) {
        mapRef.current.remove()
        mapRef.current = null
        userMarkerRef.current = null
        eventMarkerRef.current = null
        lineRef.current = null
        circleRef.current = null
      }
    }
  }, [userLocation, eventLocation, distance])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        mapInitialized.current = false
      }
    }
  }, [])

  return (
    <div 
      id="map" 
      style={{ 
        width: '100%', 
        height: '16rem', // Slightly smaller for mobile
        borderRadius: '0.5rem',
        touchAction: 'manipulation' // Optimize touch handling
      }}
    />
  )
}
