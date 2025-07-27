"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Heart, MessageCircle, Navigation, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-zinc-800 rounded-lg flex items-center justify-center">
      <div className="text-center text-zinc-400">
        <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
        <p className="text-sm font-medium">Loading Map...</p>
      </div>
    </div>
  )
})

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export default function UserMapPage() {
  const [isInterested, setIsInterested] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)

  // Event location (random coordinates in SF area)
  const eventLocation = {
    lat: 37.7749 + (Math.random() - 0.5) * 0.01, // Random location near SF
    lng: -122.4194 + (Math.random() - 0.5) * 0.01
  }

  const event = {
    id: 1,
    name: "Tech Networking Mixer",
    description:
      "Join us for an evening of networking with fellow tech professionals. Great opportunity to meet like-minded individuals, share ideas, and build meaningful connections in the San Francisco tech scene.",
    date: "December 15, 2024",
    time: "7:00 PM - 10:00 PM",
    location: "WeWork Downtown SF",
    address: "123 Market Street, San Francisco, CA 94105",
    coordinates: eventLocation,
    attendees: 24,
    maxAttendees: 50,
    host: {
      name: "Sarah Chen",
      title: "Senior Product Manager at Stripe",
      avatar: "/placeholder-user.jpg",
    },
    tags: ["Tech", "Networking", "Startup"],
    radius: "5 km",
  }

  // Check if user is within 500m of the event
  const isWithinProximity = distance !== null && distance <= 0.5

  const getLocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Location access denied. Please enable location permissions in your browser settings."
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable. Please check your GPS/network connection."
      case error.TIMEOUT:
        return "Location request timed out. Please try again."
      default:
        return `Location error: ${error.message || 'Unknown error occurred'}`
    }
  }

  const requestLocation = () => {
    setIsLoadingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.")
      setIsLoadingLocation(false)
      return
    }

    // First try to get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(newLocation)
        setLocationError(null)
        setIsLoadingLocation(false)
        
        // Calculate distance
        const dist = haversineDistance(
          newLocation.lat,
          newLocation.lng,
          eventLocation.lat,
          eventLocation.lng
        )
        setDistance(dist)
        
        console.log("Location obtained:", newLocation, "Distance:", dist.toFixed(2), "km")
      },
      (error) => {
        const errorMessage = getLocationErrorMessage(error)
        setLocationError(errorMessage)
        setIsLoadingLocation(false)
        console.error("Error getting location:", {
          code: error.code,
          message: error.message,
          timestamp: new Date().toISOString()
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  useEffect(() => {
    requestLocation()

    // Set up watch position for real-time updates
    let watchId: number | null = null

    const startWatching = () => {
      if (navigator.geolocation && userLocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
            
            // Only update if location changed significantly (>10 meters)
            if (userLocation) {
              const moveDistance = haversineDistance(
                userLocation.lat,
                userLocation.lng,
                newLocation.lat,
                newLocation.lng
              ) * 1000 // Convert to meters
              
              if (moveDistance < 10) return // Ignore small movements
            }
            
            setUserLocation(newLocation)
            
            // Calculate distance to event
            const dist = haversineDistance(
              newLocation.lat,
              newLocation.lng,
              eventLocation.lat,
              eventLocation.lng
            )
            setDistance(dist)
            
            console.log("Location updated:", newLocation, "Distance:", dist.toFixed(2), "km")
          },
          (error) => {
            console.warn("Watch position error:", {
              code: error.code,
              message: error.message,
              timestamp: new Date().toISOString()
            })
            // Don't show error for watch position failures, just log them
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      }
    }

    // Start watching after initial location is obtained
    if (userLocation) {
      startWatching()
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [userLocation, eventLocation.lat, eventLocation.lng])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-zinc-400">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-2xl font-bold">Net 0</div>
          </div>
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Location Status Banner */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${userLocation ? 'bg-green-400' : isLoadingLocation ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <div>
                  <p className="font-medium">
                    {isLoadingLocation ? 'Getting your location...' : 
                     userLocation ? 'Location found' : 'Location unavailable'}
                  </p>
                  {distance !== null && (
                    <p className="text-sm text-zinc-400">
                      {distance.toFixed(2)} km from nearest event
                    </p>
                  )}
                  {locationError && (
                    <p className="text-sm text-red-400">{locationError}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {distance !== null && (
                  <Badge variant={isWithinProximity ? "default" : "secondary"} 
                         className={isWithinProximity ? "bg-green-600 text-white" : "bg-zinc-700 text-zinc-300"}>
                    {isWithinProximity ? "Nearby Event" : "Too Far"}
                  </Badge>
                )}
                {locationError && (
                  <Button 
                    onClick={requestLocation}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? "Locating..." : "Retry"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Section - Optimized for mobile */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-0">
            {locationError ? (
              <div className="w-full h-64 bg-zinc-800 rounded-lg flex flex-col items-center justify-center p-6">
                <div className="text-center text-red-400 mb-4">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm mb-2">{locationError}</p>
                </div>
                <Button 
                  onClick={requestLocation}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? "Getting Location..." : "Try Again"}
                </Button>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-lg">
                <MapComponent 
                  userLocation={userLocation}
                  eventLocation={eventLocation}
                  distance={distance}
                />
                {/* Mobile-friendly overlay for map instructions */}
                {userLocation && (
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                    <p className="text-xs text-white">📍 Live tracking</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Details - Only show if within proximity or no location yet */}
        {(isWithinProximity || !userLocation) ? (
          <>
            <Card className="bg-zinc-900 border-zinc-800 mb-6">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-3">{event.name}</CardTitle>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-300">
                          {tag}
                        </Badge>
                      ))}
                      {distance !== null && (
                        <Badge variant={isWithinProximity ? "default" : "outline"} 
                               className={isWithinProximity ? "bg-green-600 text-white" : "border-zinc-600 text-zinc-400"}>
                          {distance.toFixed(2)} km away
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsInterested(!isInterested)}
                      className={`border-zinc-700 ${isInterested ? "text-red-400 border-red-400" : "text-zinc-400"}`}
                    >
                      <Heart className={`h-4 w-4 ${isInterested ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" className="border-zinc-700 text-zinc-400 bg-transparent">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 mb-6 leading-relaxed">{event.description}</p>

                {/* Event Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-zinc-400" />
                      <div>
                        <p className="font-medium">{event.date}</p>
                        <p className="text-sm text-zinc-400">{event.time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-zinc-400" />
                      <div>
                        <p className="font-medium">{event.location}</p>
                        <p className="text-sm text-zinc-400">{event.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-zinc-400" />
                      <div>
                        <p className="font-medium">
                          {event.attendees}/{event.maxAttendees} attending
                        </p>
                        <p className="text-sm text-zinc-400">{event.maxAttendees - event.attendees} spots left</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-zinc-400" />
                      <div>
                        <p className="font-medium">3 hours</p>
                        <p className="text-sm text-zinc-400">Event duration</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="border-t border-zinc-800 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Hosted by</h3>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{event.host.name}</p>
                      <p className="text-sm text-zinc-400">{event.host.title}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="flex-1 bg-white text-black hover:bg-zinc-200 text-lg py-6"
                disabled={!isWithinProximity && userLocation !== null}
              >
                {isWithinProximity ? "Join Event" : "Event Too Far Away"}
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 py-6 bg-transparent"
              >
                Get Directions
              </Button>
            </div>
          </>
        ) : (
          /* No Nearby Events Message */
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-16 w-16 text-zinc-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Events Nearby</h3>
              <p className="text-zinc-400 mb-4">
                There are no events within 500 meters of your current location.
              </p>
              <p className="text-sm text-zinc-500 mb-6">
                The nearest event is {distance?.toFixed(2)} km away at {event.location}
              </p>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
              >
                View All Events
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
