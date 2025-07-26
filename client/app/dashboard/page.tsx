/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash } from 'phosphor-react';
import LocationPicker from "../../components/LocationPicker";

/* ─────────────  TYPES  ───────────── */
interface Location {
  id: string;
  latitude: number;
  longitude: number;
}

interface Event {
  id: string;
  host_id: string;
  name: string;
  start_time: string;
  duration_minutes: number;
  location_id: string;
  locations?: Location;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_link?: string;
}

interface EventMember {
  event_id: string;
  member_id: string;
  users: User;
}

interface EventDetails {
  event: Event;
  members: EventMember[];
}

/* ─────────────  CONSTANTS  ───────────── */
const API = "http://localhost:8000";

export default function DashboardPage() {
  const router = useRouter();
  
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(null);
  const [myEvents, setMyEvents] = useState<{ hosted: Event[]; member_of: Event[] }>({ hosted: [], member_of: [] });
  const [eventDetails, setEventDetails] = useState<EventDetails | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    start_time: "",
    duration_minutes: 60,
    location_id: ""
  });

  /* ─────────────  LOAD CREDS  ───────────── */
  useEffect(() => {
    const raw = localStorage.getItem("netzero_creds");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCreds(parsed);
      } catch {
        router.replace("/auth");
      }
    } else {
      router.replace("/auth");
    }
  }, [router]);

  /* ─────────────  FETCH DATA  ───────────── */
  useEffect(() => {
    if (!creds) return;
    
    const fetchData = async () => {
      try {
        // Fetch my events
        const eventsRes = await fetch(`${API}/my-events`, {
          headers: {
            Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`
          }
        });
        if (!eventsRes.ok) throw new Error("Failed to fetch events");
        const eventsData = await eventsRes.json();
        setMyEvents(eventsData);

        // If user hosts an event, fetch its details
        if (eventsData.hosted.length > 0) {
          const event = eventsData.hosted[0]; // Take first hosted event
          const detailsRes = await fetch(`${API}/events/${event.id}/members`, {
            headers: {
              Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`
            }
          });
          if (detailsRes.ok) {
            const details = await detailsRes.json();
            setEventDetails(details);
          }
        } else {
          // If no hosted events, show create form
          setShowCreateForm(true);
          
          // Fetch locations for the form
          const locRes = await fetch(`${API}/locations`);
          if (locRes.ok) {
            const locData = await locRes.json();
            setLocations(locData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMsg({ kind: "error", text: "Failed to load data" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [creds]);

  /* ─────────────  HANDLERS  ───────────── */
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds) return;
    
    setCreating(true);
    setMsg(null);

    try {
      const response = await fetch(`${API}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`
        },
        body: new URLSearchParams({
          name: formData.name,
          start_time: new Date(formData.start_time).toISOString(),
          duration_minutes: formData.duration_minutes.toString(),
          location_id: formData.location_id
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create event");
      }

      setMsg({ kind: "success", text: "Event created successfully!" });
      
      // Refresh the page data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      setMsg({ kind: "error", text: error.message });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "duration_minutes" ? parseInt(value) : value
    }));
  };

  const handleLocationSelect = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      location_id: locationId
    }));
  };

  /* ─────────────  RENDER  ───────────── */
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => router.push("/profile")}
          className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          Profile
        </button>
      </div>

      {/* Status Messages */}
      {msg && (
        <div className={`rounded-lg p-4 ${
          msg.kind === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
        }`}>
          {msg.text}
        </div>
      )}

      {/* Main Content */}
      {showCreateForm ? (
        /* ─────────────  CREATE EVENT FORM  ───────────── */
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Your First Event</h2>
          <p className="text-gray-600 mb-6">You haven&apos;t hosted any events yet. Create one to get started!</p>
          
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                placeholder="Enter event name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="15"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Location Picker Component */}
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              selectedLocationId={formData.location_id}
              apiCredentials={creds}
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !formData.location_id}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      ) : eventDetails ? (
        /* ─────────────  EVENT DETAILS  ───────────── */
        <div className="space-y-6">
          {/* Event Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Your Event</h2>
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                Host
              </span>
              <button
                onClick={async () => {
                    if (!confirm("Are you sure you want to delete this event?")) return;
                    setMsg(null);
                    setLoading(true);
                    try {
                      const res = await fetch(`${API}/events/${eventDetails.event.id}`, {
                        method: "DELETE",
                        headers: {
                          Authorization: `Basic ${btoa(`${creds!.email}:${creds!.password}`)}`
                        }
                      });
                      if (!res.ok) throw new Error("Failed to delete event");
                      setMsg({ kind: "success", text: "Event deleted." });
                      setTimeout(() => window.location.reload(), 800);
                    } catch (err: any) {
                      setMsg({ kind: "error", text: err.message || "Delete failed." });
                    } finally {
                      setLoading(false);
                    }
                  }}
                className="rounded-lg bg-white px-3 py-1 text-sm text-red-500 hover:bg-red-700"
            >
                <Trash size={24} />
            </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{eventDetails.event.name}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Start:</span><br />
                  {new Date(eventDetails.event.start_time).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Duration:</span><br />
                  {eventDetails.event.duration_minutes} minutes
                </div>
                <div>
                  <span className="font-medium">Location:</span><br />
                  {eventDetails.event.locations ? 
                    `${eventDetails.event.locations.latitude.toFixed(2)}, ${eventDetails.event.locations.longitude.toFixed(2)}` :
                    "Location not found"
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Members */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Members ({eventDetails.members.length})
            </h3>
            
            {eventDetails.members.length === 0 ? (
              <p className="text-gray-500">No members have joined yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventDetails.members.map((member) => (
                  <div key={member.member_id} className="flex items-center space-x-3 p-3 rounded-lg border">
                    {member.users.avatar_link ? (
                      <Image
                        src={member.users.avatar_link}
                        alt={member.users.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {member.users.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{member.users.name}</p>
                      <p className="text-sm text-gray-500">{member.users.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Events I'm Member Of */}
      {myEvents.member_of.length > 0 && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events I&apos;m Attending ({myEvents.member_of.length})
          </h3>
          <div className="space-y-3">
            {myEvents.member_of.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-gray-900">{event.name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.start_time).toLocaleString()} • {event.duration_minutes} min
                  </p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                  Member
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}