/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ─────────────  CONSTANTS  ───────────── */
const API = "http://localhost:8000";

/* ─────────────  COMPONENT ───────────── */
export default function HostDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const opencageKey = "60b3fcf5da8b4c0bb376bb882021a9ab"; // Replace with your actual key

  // Simple in-memory cache
  const geocodeCache: Record<string, string> = {};

  function useOpenCageGeocode(lat: number, lon: number) {
    const [address, setAddress] = useState<string | null>(null);
    useEffect(() => {
      if (typeof lat !== "number" || typeof lon !== "number") return;
      const key = `${lat},${lon}`;
      if (geocodeCache[key]) {
        setAddress(geocodeCache[key]);
        return;
      }
      let cancelled = false;
      async function fetchGeocode() {
        try {
          const resp = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${opencageKey}`
          );
          const data = await resp.json();
          const result = data.results?.[0]?.formatted || "";
          const trimmed = result.length > 60 ? result.slice(0, 60) + "..." : result;
          geocodeCache[key] = trimmed;
          if (!cancelled) setAddress(trimmed);
        } catch {
          if (!cancelled) setAddress(null);
        }
      }
      fetchGeocode();
      return () => {
        cancelled = true;
      };
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
          Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch members");
      const data = await res.json();
      setMembers((prev) => ({ ...prev, [eventId]: data.members || [] }));
    } catch {
      setMembers((prev) => ({ ...prev, [eventId]: [] }));
    }
    setLoadingMembers(null);
  };

  function GeocodeSpan({ lat, lon }: { lat: number; lon: number }) {
    const address = useOpenCageGeocode(lat, lon);
    if (address)
      return <span title={address}>{address}</span>;
    return (
      <span>
        {lat.toFixed(2)}, {lon.toFixed(2)}{" "}
        <span className="italic text-zinc-400">(resolving…)</span>
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
        Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
      })
      .then((data) => {
        setEvents(data.hosted || []);
      })
      .catch(() => {
        setMsg("Error loading events");
      })
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white relative overflow-hidden">
      {/* Feedback/messages */}
      {msg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-lg px-6 py-3 ${
            msg ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/[0.02] to-transparent rounded-full"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-400" />
              Net 0
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                JD
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-300">Host Dashboard</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Manage
            <span className="ml-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Events
            </span>
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            See, track, and manage your hosted events and attendees.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button
              onClick={() => router.refresh()}
              className="h-12 border-white/30 text-white hover:bg-white/10 bg-transparent transition-all duration-300 text-lg font-medium hover:border-white/50 hover:scale-[1.02] transform"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={() => router.push("/create-event")}
              className="h-12 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 font-semibold transition-all duration-300 transform hover:scale-[1.02] text-lg shadow-2xl"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14 z-10 relative">
          <Card className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-300">
                Total Events
              </CardTitle>
              <div className="text-4xl font-bold text-blue-400">{events.length}</div>
            </CardHeader>
          </Card>
          <Card className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-300">
                Total Attendees
              </CardTitle>
              <div className="text-4xl font-bold text-purple-400">
                {events.reduce((sum, ev) => sum + (ev.attendees_count || 0), 0)}
              </div>
            </CardHeader>
          </Card>
          <Card className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-pink-300">
                Active Events
              </CardTitle>
              <div className="text-4xl font-bold text-pink-400">
                {events.filter((ev) => !ev.ended).length}
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-lg text-gray-400">Loading events…</div>
          ) : events.length === 0 ? (
            <div className="text-zinc-500 text-center">
              No hosted events found. Create one!
            </div>
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500"
              >
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl text-white font-semibold mb-2">{event.name}</h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge
                              variant={event.status === "active" ? "default" : "secondary"}
                              className={
                                event.status === "Active"
                                  ? "bg-zinc-600"
                                  : "bg-green-500"
                              }
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
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={async () => {
                                // Confirm action
                                if (!window.confirm("Delete this event? This cannot be undone.")) return;

                                // Grab user credentials from localStorage (same as in useEffect)
                                const raw = localStorage.getItem("netzero_creds");
                                if (!raw) {
                                  alert("Not logged in");
                                  router.replace("/auth");
                                  return;
                                }
                                const creds = JSON.parse(raw);

                                // Optimistic UI: Set loading state or disable UI if needed
                                setMsg(null);

                                try {
                                  const resp = await fetch(`${API}/events/${event.id}`, {
                                    method: "DELETE",
                                    headers: {
                                      Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`,
                                    },
                                  });
                                  if (!resp.ok) {
                                    const err = await resp.json().catch(() => ({}));
                                    throw new Error(err.detail || "Failed to delete event");
                                  }
                                  // Remove from UI
                                  setEvents((evs) => evs.filter((ev) => ev.id !== event.id));
                                  setMsg("Event deleted");
                                  setTimeout(() => setMsg(null), 1500);
                                } catch (err: any) {
                                  setMsg(err.message || "Delete failed");
                                  setTimeout(() => setMsg(null), 2000);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-md text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          <span>
                            {new Date(event.start_time).toLocaleDateString()} at{" "}
                            {new Date(event.start_time).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {event.locations?.latitude && event.locations?.longitude ? (
                            <GeocodeSpan
                              lat={event.locations.latitude}
                              lon={event.locations.longitude}
                            />
                          ) : (
                            <span>Location not found</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          <span>{event.attendees_count ?? 0} attendees</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Expandable Members */}
                  {expandedEvent === event.id && (
                    <div className="mt-8 border-t border-purple-900/40 pt-4 bg-black/40 rounded-xl backdrop-blur-sm animate-in slide-in-from-bottom-2">
                      <h4 className="text-lg font-bold mb-2 pl-4 text-white/90">Members</h4>
                      {loadingMembers === event.id ? (
                        <div>Loading members…</div>
                      ) : members[event.id]?.length ? (
                        <ul className="space-y-4">
                          {members[event.id].map((m: any) => {
                            const u = m.users || {};
                            return (
                              <li
                                key={m.member_id}
                                className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-black/30 rounded-xl p-4 shadow"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12 ring-2 ring-white/20">
                                    {u.avatar_link ? (
                                      <AvatarImage src={u.avatar_link} />
                                    ) : (
                                      <AvatarFallback>
                                        {u.name?.charAt(0) ?? "?"}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <div className="font-bold text-blue-200 text-lg">{u.name}</div>
                                    <div className="text-xs text-gray-400">{u.email}</div>
                                    {u.bio && (
                                      <div className="mt-1 text-sm text-purple-300 line-clamp-2">
                                        {u.bio}
                                      </div>
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
                        <div className="text-gray-400">No members found.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
