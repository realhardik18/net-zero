'use client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Plus, MoreHorizontal, Edit3, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function HostDashboard() {
  const router = useRouter();
  const events = [
    {
      id: 1,
      name: "Tech Networking Mixer",
      date: "Dec 15, 2024",
      time: "7:00 PM",
      location: "Downtown SF",
      attendees: 24,
      maxAttendees: 50,
      status: "active",
      tags: ["Tech", "Networking"],
    },
    {
      id: 2,
      name: "Startup Founders Meetup",
      date: "Dec 20, 2024",
      time: "6:30 PM",
      location: "Mission Bay",
      attendees: 12,
      maxAttendees: 30,
      status: "active",
      tags: ["Startup", "Founders"],
    },
    {
      id: 3,
      name: "Design Workshop",
      date: "Dec 10, 2024",
      time: "2:00 PM",
      location: "SOMA",
      attendees: 18,
      maxAttendees: 25,
      status: "completed",
      tags: ["Design", "Workshop"],
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Net 0</div>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Events</h1>
            <p className="text-zinc-400">Manage and track your hosted events</p>
          </div>
          <Button onClick={() => router.push("/create-event")} className="bg-white text-black hover:bg-zinc-200">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-zinc-400 mt-1">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">324</div>
              <p className="text-xs text-zinc-400 mt-1">+18% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">3</div>
              <p className="text-xs text-zinc-400 mt-1">2 upcoming</p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {event.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-300">
                              {tag}
                            </Badge>
                          ))}
                          <Badge
                            variant={event.status === "active" ? "default" : "secondary"}
                            className={event.status === "active" ? "bg-green-600" : "bg-zinc-600"}
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-zinc-900 border-zinc-700">
                          <DropdownMenuItem className="text-zinc-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-zinc-300">
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {event.date} at {event.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.attendees}/{event.maxAttendees} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
