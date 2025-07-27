'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, Calendar, MapPin, Users, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Simple auth check: netzero_creds in localStorage
    try {
      const raw = localStorage.getItem("netzero_creds");
      if (raw) {
        const creds = JSON.parse(raw);
        setIsLoggedIn(true);
        setUser({ name: creds.name || "User", email: creds.email });
      }
    } catch {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-white/[0.02] to-transparent rounded-full"></div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-400" />
            <span className="text-2xl font-bold text-white">Net 0</span>
          </div>
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  className="text-zinc-300 hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-300"
                  onClick={() => router.push("/auth")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-semibold shadow-xl hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 transition-all duration-300"
                  onClick={() => router.push("/create-event")}
                >
                  Get Started
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-zinc-300 hover:bg-white/10 border border-white/20 hover:border-white/30 transition-all duration-300"
                  onClick={() => router.push("/host-dashboard")}
                >
                  My Events
                </Button>
                <Avatar className="ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {user?.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-300">Effortless Event Networking</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-white">
            Connect through
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              meaningful events
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover and create events that matter. Build genuine connections in your community with location-based networking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => isLoggedIn ? router.push("/create-event") : router.push("/auth")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-semibold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-lg px-8 py-6 shadow-xl transition-all duration-300"
            >
              Start Creating Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/5 text-lg px-8 py-6 bg-transparent transition-all duration-300"
              onClick={() => router.push("/host-dashboard")}
            >
              Manage events
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-10 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Create Events</h3>
            <p className="text-gray-300">
              Design and host events with precise location targeting and customizable parameters.
            </p>
          </div>

          <div className="text-center p-10 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Location-Based</h3>
            <p className="text-gray-300">Find events near you with intelligent radius-based discovery and mapping.</p>
          </div>

          <div className="text-center p-10 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-lg">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-white">Build Network</h3>
            <p className="text-gray-300">Connect with like-minded individuals and grow your professional network.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Ready to start connecting?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of event creators and attendees building meaningful connections.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white font-semibold hover:from-blue-600 hover:via-purple-700 hover:to-pink-700 text-lg px-8 py-6 shadow-xl transition-all duration-300"
            onClick={() => isLoggedIn ? router.push("/create-event") : router.push("/auth")}
          >
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-black/10 backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Net 0. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
