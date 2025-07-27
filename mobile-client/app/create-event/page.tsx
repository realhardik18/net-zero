"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import dynamic from "next/dynamic";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Target,
  Sparkles,
  Save,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ─────────────  MAP (no‑SSR)  ───────────── */
const LocationMap = dynamic(() => import("@/components/LocationMap"), { ssr: false });

/* ─────────────  CONSTANTS  ───────────── */
const API = "http://localhost:8000"; // ← keep absolute URL, matches dashboard

/* ─────────────  TYPES  ───────────── */
interface Creds {
  email: string;
  password: string;
}

interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
}

export default function CreateEvent() {
  const router = useRouter();

  /* ─────────────  GLOBAL / BACKEND STATE  ───────────── */
  const [creds, setCreds] = useState<Creds | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    { lat: number; lng: number; address: string } | null
  >(null);

  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  /* ─────────────  CREDENTIAL BOOTSTRAP  ───────────── */
  useEffect(() => {
    const raw = localStorage.getItem("netzero_creds");
    if (!raw) {
      router.replace("/auth");
      return;
    }
    try {
      setCreds(JSON.parse(raw));
    } catch {
      router.replace("/auth");
    }
  }, [router]);


  /* ─────────────  LOCATION HANDLER  ───────────── */
  const handleLocationSelect = (loc: { lat: number; lng: number; address: string }) =>
    setSelectedLocation(loc);

  /* ─────────────  EVENT CREATION  ───────────── */
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creds) return;

    setIsCreating(true);
    setMsg(null);

    try {
      /* 1️⃣  If user picked a point on the map, create/get a Location row first */
      let locationId = "";
      if (selectedLocation) {
        const locRes = await fetch(`${API}/locations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`,
          },
          body: new URLSearchParams({
            latitude: selectedLocation.lat.toString(),
            longitude: selectedLocation.lng.toString(),
          }),
        });
        if (!locRes.ok) throw new Error("Failed to create location");
        const locData: LocationRecord = await locRes.json();
        locationId = locData.id;
      } else {
        throw new Error("Please pick a location");
      }

      /* 2️⃣  Assemble ISO start_time from date + time inputs */
      const isoStart = new Date(`${date}T${time}:00`).toISOString();

      /* 3️⃣  Create the event */
      const evRes = await fetch(`${API}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${creds.email}:${creds.password}`)}`,
        },
        body: new URLSearchParams({
          name: eventName,
          start_time: isoStart,
          duration_minutes: "60", 
          location_id: locationId,
          description,
        }),
      });

      if (!evRes.ok) {
        const err = await evRes.json().catch(() => ({}));
        throw new Error(err.detail || "Event creation failed");
      }

      setMsg({ kind: "success", text: "Event created successfully!" });
      setTimeout(() => window.location.href = "/host-dashboard", 800);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setMsg({ kind: "error", text: err.message || "Unknown error" });
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid =
    eventName.trim() &&
    description.trim() &&
    selectedLocation &&
    date &&
    time;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white relative overflow-hidden">
      {msg && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] rounded-lg px-6 py-3 ${
            msg.kind === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {msg.text}
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
            <span className="text-sm text-gray-300">Create Impact</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Create New
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Event
            </span>
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed">
            Bring people together for positive climate action and meaningful connections
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              <CardHeader className="pb-8">
                <CardTitle className="text-2xl flex items-center gap-3 text-white group-hover:text-blue-400 transition-colors duration-300">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Sparkles className="h-6 w-6 text-blue-400" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Event Name */}
                <div className="space-y-3 group">
                  <Label htmlFor="name" className="text-lg font-medium text-white flex items-center gap-2">
                    Event Name
                    <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      value={eventName}
                      onChange={(e) => setEventName(e.target.value)}
                      placeholder="Enter a compelling event name"
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-14 text-lg focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                    />
                    {eventName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-medium text-white flex items-center gap-2">
                    Description
                    <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your event's purpose, activities, and impact..."
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 min-h-[140px] resize-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">{description.length}/500</div>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="space-y-3">
                  <Label className="text-lg font-medium text-white flex items-center gap-2">
                    Date & Time
                    <span className="text-red-400">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative group">
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e)=>setDate(e.target.value)}
                        className="bg-white/5 border-white/20 text-white pl-12 h-14 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                      />
                    </div>
                    <div className="relative group">
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-300" />
                      <Input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e)=>setTime(e.target.value)}
                        className="bg-white/5 border-white/20 text-white pl-12 h-14 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location & Radius Sidebar */}
          <div className="space-y-8">
            {/* Location */}
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500 group sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white text-xl group-hover:text-green-400 transition-colors duration-300">
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <MapPin className="h-5 w-5 text-green-400" />
                  </div>
                  Location
                  <span className="text-red-400 text-sm">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Search for a location..."
                    value={selectedLocation?.address || ""}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 pl-12 focus:border-green-400/50 focus:ring-2 focus:ring-green-400/20 transition-all duration-300 h-12 hover:border-white/30"
                    readOnly
                  />
                  {selectedLocation && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>

                {/* Interactive Map */}
                <div className="w-full h-64 rounded-xl overflow-hidden border border-white/20 hover:border-white/30 transition-all duration-300 group">
                  <LocationMap onLocationSelect={handleLocationSelect} />
                </div>

                {selectedLocation && (
                  <div className="text-sm text-gray-300 bg-gradient-to-r from-green-500/10 to-blue-500/10 p-4 rounded-lg border border-green-500/20 animate-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <strong className="text-white">Selected Location</strong>
                    </div>
                    <div className="text-gray-300">{selectedLocation.address}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Action Buttons */}
        <Card className="mt-12 bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <Button
                variant="outline"
                className="flex-1 h-16 border-white/30 text-white hover:bg-white/10 bg-transparent transition-all duration-300 text-lg font-medium hover:border-white/50 hover:scale-[1.02] transform"
              >
                <Save className="h-5 w-5 mr-2" />
                Save as Draft
              </Button>
              <Button
                onClick={handleCreateEvent}
                disabled={!isFormValid || isCreating}
                className="flex-1 h-16 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 font-semibold transition-all duration-300 transform hover:scale-[1.02] text-lg shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Create Event
                  </>
                )}
                {isCreating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-700/50 to-pink-700/50 animate-pulse"></div>
                )}
              </Button>
            </div>
            {!isFormValid && (
              <div className="mt-4 text-center text-sm text-yellow-400 flex items-center justify-center gap-2">
                <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
                Please fill in all required fields to create your event
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
