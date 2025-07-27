"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface LocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
}

export default function LocationMap({ onLocationSelect }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [51.505, -0.09], // Default to London
      zoom: 13,
      zoomControl: true,
    })

    mapInstanceRef.current = map

    // Add tile layer with dark theme
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
      maxZoom: 20,
    }).addTo(map)

    // Custom marker icon (emerald green)
    const customIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 24px; 
        height: 24px; 
        background: #10b981; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          width: 0; 
          height: 0; 
          border-left: 6px solid transparent; 
          border-right: 6px solid transparent; 
          border-top: 10px solid #10b981; 
          position: absolute; 
          bottom: -8px; 
          left: 50%; 
          transform: translateX(-50%);
        "></div>
      </div>`,
      iconSize: [24, 34],
      iconAnchor: [12, 34],
    })

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.setView([latitude, longitude], 15)
          setIsLoading(false)
        },
        () => {
          setIsLoading(false)
        }
      )
    } else {
      setIsLoading(false)
    }

    // Handle map clicks
    map.on("click", async (e) => {
      const { lat, lng } = e.latlng

      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }

      // Add new marker
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)
      markerRef.current = marker

      // Reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
        )
        const data = await response.json()
        const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        
        // Update parent component
        onLocationSelect({ lat, lng, address })

        // Add popup to marker
        marker.bindPopup(`
          <div style="color: black; font-size: 12px; max-width: 200px;">
            <strong>Selected Location</strong><br/>
            ${address}
          </div>
        `).openPopup()
      } catch (error) {
        console.error("Error getting address:", error)
        onLocationSelect({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` })
      }
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [onLocationSelect])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-800 rounded-lg flex items-center justify-center">
          <div className="text-center text-zinc-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-2"></div>
            <p className="text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
        Click to select location
      </div>
    </div>
  )
}
