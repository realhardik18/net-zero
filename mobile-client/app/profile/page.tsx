/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, ArrowLeft, Save } from "lucide-react";

const API = "http://localhost:8000";

interface Profile {
  name?: string;
  email: string;
  bio?: string;
  x?: string;
  github?: string;
  linkedin?: string;
  avatar_link?: string;
  tags?: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(false);

  // Track if socials changed
  const prevLinkedin = useRef<string | undefined>(undefined);
    const prevX = useRef<string | undefined>(undefined);


  useEffect(() => {
    const raw = localStorage.getItem("netzero_creds");
    if (!raw) {
      router.replace("/auth");
      return;
    }
    const creds = JSON.parse(raw);

    fetch(`${API}/profile/${encodeURIComponent(creds.email)}?password=${encodeURIComponent(creds.password)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setForm({ ...data });
        prevLinkedin.current = data.linkedin;
        prevX.current = data.x;
      })
      .catch(() => setMsg({ kind: "error", text: "Could not load profile" }))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleChange = (key: keyof Profile, value: string) => {
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [key]: value,
          }
        : prev
    );
  };

  // Update profile, then sync tags if socials changed
  const handleSave = async () => {
    if (!form || !form.email) return;
    setIsSaving(true);
    setMsg(null);
  
    try {
      const res = await fetch(`${API}/profile/${encodeURIComponent(form.email)}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Update failed");
      }
      setProfile(form);
      setMsg({ kind: "success", text: "Profile updated" });
  
      // No more extract-tags call, don't wait for tags
      prevLinkedin.current = form.linkedin;
      prevX.current = form.x;
  
      setTimeout(() => setMsg(null), 1500);
    } catch (err: any) {
      setMsg({ kind: "error", text: err.message || "Failed to update" });
    } finally {
      setIsSaving(false);
    }
  };
  

  // Colors for tag chips (randomized)
  const TAG_COLORS = [
    "bg-pink-500 text-white",
    "bg-teal-400 text-black",
    "bg-pink-400 text-white",
    "bg-blue-400 text-white",
    "bg-rose-400 text-white",
  ];

  function renderTags(tags: string[] | undefined) {
    if (!tags || !tags.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {tags.map((tag, i) => (
          <span
            key={tag + i}
            className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md border border-white/10
              ${TAG_COLORS[i % TAG_COLORS.length]} bg-opacity-60 backdrop-blur-sm animate-in fade-in`}
          >
            {tag}
          </span>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white">
        <div className="text-lg text-gray-300 animate-pulse">Loading profile…</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white">
        <div className="text-lg text-red-400">Failed to load profile</div>
      </div>
    );
  }

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
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/[0.02] to-transparent rounded-full"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={() => router.back()}
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
          
          <Avatar className="ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300">
            <AvatarImage src={form.avatar_link || "/placeholder-user.jpg"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {form.name?.charAt(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="relative container mx-auto px-4 py-12 max-w-3xl">
        <Card className="bg-black/20 border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-500">
          <CardHeader className="pb-6 flex flex-col items-center">
            <Avatar className="w-24 h-24 ring-2 ring-blue-500/40 mb-3">
              <AvatarImage src={form.avatar_link || "/placeholder-user.jpg"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-3xl">
                {form.name?.charAt(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold text-white mb-2">Your Profile</CardTitle>
            <div className="text-lg text-gray-300">{form.email}</div>
            {/* Tags */}
            {renderTags(form.tags)}
            {tagsLoading && (
              <div className="mt-2 text-xs text-blue-400 animate-pulse">Syncing tags from socials…</div>
            )}
          </CardHeader>
          <CardContent className="space-y-8 mt-6">
            {/* Name */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white" htmlFor="name">
                Name
              </label>
              <Input
                id="name"
                value={form.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your name"
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-14 text-lg focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
              />
            </div>
            {/* Bio */}
            <div>
              <label className="block text-lg font-medium mb-2 text-white" htmlFor="bio">
                Bio
              </label>
              <Textarea
                id="bio"
                value={form.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Share something about yourself..."
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 min-h-[80px] resize-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
              />
            </div>
            {/* Socials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-lg font-medium mb-2 text-white" htmlFor="x">
                  X (Twitter)
                </label>
                <Input
                  id="x"
                  value={form.x || ""}
                  onChange={(e) => handleChange("x", e.target.value)}
                  placeholder="Username (no @ needed)"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12 text-base focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-white" htmlFor="github">
                  GitHub
                </label>
                <Input
                  id="github"
                  value={form.github || ""}
                  onChange={(e) => handleChange("github", e.target.value)}
                  placeholder="GitHub username"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12 text-base focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-2 text-white" htmlFor="linkedin">
                  LinkedIn
                </label>
                <Input
                  id="linkedin"
                  value={form.linkedin || ""}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="LinkedIn handle"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 h-12 text-base focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 hover:border-white/30"
                />
              </div>
            </div>
            {/* Save Button */}
            <div className="flex justify-end">\
                <Button
                    onClick={() => {
                        localStorage.removeItem("netzero_creds");
                        router.replace("/auth");
                    }}
                    variant="outline"
                    className="text-white bg-red-500 hover:bg-white text-md hover:text-red-500 py-[1.75rem] transition-all duration-300 mr-4"
                    >
                    Logout
                </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || tagsLoading}
                className="h-14 px-10 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-semibold transition-all duration-300 hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 shadow-2xl disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
