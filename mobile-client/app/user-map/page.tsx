"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Heart, MessageCircle } from "lucide-react"
import { useState } from "react"

export default function UserMapPage() {
  const [isInterested, setIsInterested] = useState(false)

  const event = {
    id: 1,
    name: "Tech Networking Mixer",
    description:
      "Join us for an evening of networking with fellow tech professionals. Great opportunity to meet like-minded individuals, share ideas, and build meaningful connections in the San Francisco tech scene.",
    date: "December 15, 2024",
    time: "7:00 PM - 10:00 PM",
    location: "WeWork Downtown SF",
    address: "123 Market Street, San Francisco, CA 94105",
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
        {/* Map Section */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="p-0">
            <div className="w-full h-64 md:h-80 bg-zinc-800 rounded-t-lg flex items-center justify-center relative">
              <div className="text-center text-zinc-400">
                <MapPin className="h-12 w-12 mx-auto mb-3" />
                <p className="text-lg font-medium">Interactive Map</p>
                <p className="text-sm">Event location and radius visualization</p>
              </div>

              {/* Map overlay info */}
              <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="text-white font-medium">{event.location}</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Radius: {event.radius}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Details */}
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
          <Button className="flex-1 bg-white text-black hover:bg-zinc-200 text-lg py-6">Join Event</Button>
          <Button
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8 py-6 bg-transparent"
          >
            Get Directions
          </Button>
        </div>
      </div>
    </div>
  )
}
