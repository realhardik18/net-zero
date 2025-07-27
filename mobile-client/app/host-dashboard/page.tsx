/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Users, Plus, MoreHorizontal, Edit3, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const API = "http://localhost:8000";

export default function HostDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  function useReverseGeocode(lat: number, lon: number) {
    const [address, setAddress] = useState<string | null>(null);
  
    useEffect(() => {
      if (!lat || !lon) return;
      setAddress(null);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then((r) => r.json())
        .then((data) => setAddress(data.display_name || null))
        .catch(() => setAddress(null));
    }, [lat, lon]);
  
    return address;
  }

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [members, setMembers] = useState<Record<string, any[]>>({});
  const [loadingMembers, setLoadingMembers] = useState<string | null>(null);

  // fetch members only when expanded, not already loaded
  const handleExpand = async (eventId: string) => {
    if (expandedEvent === eventId) {
      setExpandedEvent(null);
      return;
    }
    setExpandedEvent(eventId);
    if (members[eventId]) return; // Already loaded

    const raw = localStorage.getItem("netzero_creds");
    if (!raw) return;
    const creds = JSON.parse(raw);

    setLoadingMembers(eventId);
    try {
      const res = await fetch(`${API}/events/${eventId}/members`, {
        headers: {
          Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`
        }
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers(prev => ({ ...prev, [eventId]: data.members || [] }));
    } catch {
      setMembers(prev => ({ ...prev, [eventId]: [] }));
    }
    setLoadingMembers(null);
  };

  function GeocodeSpan({ lat, lon }: { lat: number; lon: number }) {
    const address = useReverseGeocode(lat, lon);
    if (address) return <span>{address}</span>;
    return (
      <span>
        {lat.toFixed(2)}, {lon.toFixed(2)} (resolving…)
      </span>
    );
  }  
  useEffect(() => {
    const raw = localStorage.getItem("netzero_creds");
    if (!raw) {
      router.replace("/auth");
      return;
    }
    const creds = JSON.parse(raw);
    fetch(`${API}/my-events`, {
      headers: {
        Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then(data => {
        setEvents(data.hosted || []);
      })
      .catch(e => {
        setMsg("Error loading events");
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans"
    style={{
      background: "radial-gradient(ellipse at 60% 20%, #20134e 0%, #100924 60%, #080017 100%)",
      color: "#fff",
    }}>
    {/* STARFIELD */}
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background:
          "repeating-radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10) 1px, transparent 1.5px, transparent 100px), " +
          "repeating-radial-gradient(circle at 80% 70%, rgba(255,255,255,0.13) 0.5px, transparent 1.5px, transparent 100px), " +
          "repeating-radial-gradient(circle at 40% 85%, rgba(255,255,255,0.08) 1px, transparent 1.8px, transparent 80px)",
        backgroundSize: "cover",
        opacity: 0.6,
        filter: "blur(0.5px)",
      }}
    />
    <div className="min-h-screen bg-black text-white">
      {/* ...header... */}
      <header className="border-b border-purple-900/50 bg-black/40 backdrop-blur-md z-10 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 text-transparent bg-clip-text border-none cursor-pointer p-0 hover:opacity-80 transition"
            style={{ background: "none" }}
          >Net zero</button>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Events</h1>
            <p className="text-zinc-400">Manage and track your hosted events</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.refresh()} className="bg-white text-black hover:bg-zinc-200">
              <RefreshCw className="h-4 w-4" />
              Refresh stats
            </Button>
            <Button onClick={() => router.push("/create-event")} className="bg-white text-black hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Feedback/messages */}
        {msg && <div className="mb-4 text-red-400">{msg}</div>}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 z-10 relative">
          <Card className="bg-gradient-to-br from-purple-900/40 via-purple-950/70 to-black/70 border-purple-800/60 shadow-lg backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-200">Total Events</CardTitle>
              <div className="text-3xl font-bold text-purple-300 drop-shadow-glow">{events.length}</div>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-fuchsia-800/30 via-indigo-900/60 to-black/80 border-fuchsia-900/50 shadow-lg backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-fuchsia-200">Total Attendees</CardTitle>
              <div className="text-3xl font-bold text-fuchsia-200 drop-shadow-glow">
                {events.reduce((sum, ev) => sum + (ev.attendees_count || 0), 0)}
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-blue-900/40 via-blue-950/70 to-black/70 border-blue-900/60 shadow-lg backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-200">Active Events</CardTitle>
              <div className="text-3xl font-bold text-blue-200 drop-shadow-glow">
                {events.filter(ev => !ev.ended).length}
              </div>
            </CardHeader>
          </Card>
        </div>


        {/* Events List */}
        <div className="space-y-4">
          {loading ? (
            <div>Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-zinc-500">No hosted events found. Create one!</div>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="bg-gradient-to-br from-purple-900/30 via-black/70 to-black/80 border-purple-900/60 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl text-white/90 font-semibold mb-2">{event.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge
                              variant={event.status === "active" ? "default" : "secondary"}
                              className={event.status === "Active" ? "bg-zinc-600" : "bg-green-500 "}
                            >
                              {event.status || "Active"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400"
                            onClick={() => handleExpand(event.id)}
                          >
                            {expandedEvent === event.id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
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
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.start_time).toLocaleDateString()} at{" "}
                            {new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.locations?.latitude && event.locations?.longitude ? (
                            <GeocodeSpan lat={event.locations.latitude} lon={event.locations.longitude} />
                          ) : (
                            <span>Location not found</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {event.attendees_count ?? 0} attendees
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Expandable Members */}
                  {expandedEvent === event.id && (
                    <div className="mt-6 border-t border-fuchsia-800/50 pt-4 bg-black rounded-xl backdrop-blur-sm">
                      <h4 className="text-lg font-bold mb-2 pl-4 text-white/90">Members</h4>
                      {loadingMembers === event.id ? (
                        <div>Loading members…</div>
                      ) : (members[event.id]?.length ? (
                        <ul className="space-y-4">
                          {members[event.id].map((m: any) => {
                            const u = m.users || {};
                            return (
                              <li
                                key={m.member_id}
                                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black rounded-xl p-4 shadow"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12">
                                    {u.avatar_link ? (
                                      <AvatarImage src={u.avatar_link} />
                                    ) : (
                                      <AvatarFallback>{u.name?.charAt(0) ?? "?"}</AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <div className="font-bold text-purple-200 text-lg">{u.name}</div>
                                    <div className="text-xs text-zinc-400">{u.email}</div>
                                    {u.bio && (
                                      <div className="mt-1 text-sm text-fuchsia-300 line-clamp-2">{u.bio}</div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2 sm:mt-0 sm:ml-auto">
                                  {u.x && (
                                    <a
                                      href={`https://x.com/${u.x.replace(/^@/, "")}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 rounded-full bg-gradient-to-r from-black via-gray-700 to-fuchsia-900 text-xs text-white border border-fuchsia-600 hover:bg-fuchsia-950 transition"
                                    >
                                      X: @{u.x.replace(/^@/, "")}
                                    </a>
                                  )}
                                  {u.github && (
                                    <a
                                      href={`https://github.com/${u.github}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 rounded-full bg-gradient-to-r from-black via-gray-700 to-purple-900 text-xs text-white border border-purple-600 hover:bg-purple-950 transition"
                                    >
                                      GitHub
                                    </a>
                                  )}
                                  {u.linkedin && (
                                    <a
                                      href={`https://linkedin.com/in/${u.linkedin}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-1 rounded-full bg-gradient-to-r from-black via-gray-700 to-blue-900 text-xs text-white border border-blue-600 hover:bg-blue-950 transition"
                                    >
                                      LinkedIn
                                    </a>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="text-zinc-400">No members found.</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
