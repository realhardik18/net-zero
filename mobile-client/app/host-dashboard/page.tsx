'use client';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Users, Plus, MoreHorizontal, Edit3, Trash2, Eye, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react";

interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

interface Event {
  id: string;
  name: string;
  start_time: string;
  duration_minutes: number;
  host_id: string;
  location_id: string;
  locations?: Location;
  attendee_count?: number;
}

interface MyEventsResponse {
  hosted: Event[];
  member_of: Event[];
}

export default function HostDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventInfo, setEventInfo] = useState<string[]>([]); // New state for extracted text

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const credentials = localStorage.getItem('auth');
      if (!credentials) {
        router.push('/auth');
        return;
      }

      const { email, password } = JSON.parse(credentials);
      const response = await fetch('http://localhost:8000/my-events', {
        headers: {
          'Authorization': 'Basic ' + btoa(`${email}:${password}`),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: MyEventsResponse = await response.json();
      setEvents(data.hosted || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
    extractEventInfo(); // Extract event info on component mount
  }, []);

  const extractEventInfo = () => {
    const elements = document.querySelectorAll(".jsx-3365490771.icon-row.flex-center.gap-3");
    const extractedText = Array.from(elements).map(el => el.textContent?.trim() || "");
    setEventInfo(extractedText);
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getEventStatus = (startTime: string, durationMinutes: number): 'upcoming' | 'active' | 'completed' => {
    const now = new Date();
    const eventStart = new Date(startTime);
    const eventEnd = new Date(eventStart.getTime() + durationMinutes * 60000);
    
    if (now < eventStart) return 'upcoming';
    if (now >= eventStart && now <= eventEnd) return 'active';
    return 'completed';
  };

  const activeEvents = events.filter(event => getEventStatus(event.start_time, event.duration_minutes) !== 'completed');
  const totalAttendees = events.reduce((sum, event) => sum + (event.attendee_count || 0), 0);

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
              <div className="text-3xl font-bold">{loading ? '...' : events.length}</div>
              <p className="text-xs text-zinc-400 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Total Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : totalAttendees}</div>
              <p className="text-xs text-zinc-400 mt-1">Across all events</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '...' : activeEvents.length}</div>
              <p className="text-xs text-zinc-400 mt-1">Upcoming & ongoing</p>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading events...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-400">Error: {error}</p>
            <Button onClick={fetchMyEvents} className="mt-4">
              Try Again
            </Button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-400 mb-4">You haven&apos;t created any events yet.</p>
            <Button onClick={() => router.push("/create-event")} className="bg-white text-black hover:bg-zinc-200">
              Create Your First Event
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const status = getEventStatus(event.start_time, event.duration_minutes);
              return (
                <Card key={event.id} className="bg-zinc-900 border-zinc-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge
                                variant={status === "active" ? "default" : "secondary"}
                                className={
                                  status === "active" 
                                    ? "bg-green-600" 
                                    : status === "upcoming"
                                    ? "bg-blue-600"
                                    : "bg-zinc-600"
                                }
                              >
                                {status}
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
                              {formatDate(event.start_time)} at {formatTime(event.start_time)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {event.locations ? 
                                `${event.locations.latitude.toFixed(4)}, ${event.locations.longitude.toFixed(4)}` : 
                                'Location TBD'
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {event.attendee_count || 0} attendees
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {/* Display extracted event info */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Extracted Event Info</h2>
          <ul className="list-disc pl-5 text-zinc-400">
            {eventInfo.map((info, index) => (
              <li key={index}>{info}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
