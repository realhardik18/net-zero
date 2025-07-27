'use client';
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Net 0</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-zinc-400 hover:text-white">
              Sign In
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Connect through
            <span className="block text-zinc-400">meaningful events</span>
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Discover and create events that matter. Build genuine connections in your community with location-based
            networking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push("/create-event")} size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-6">
              Start Creating Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-900 text-lg px-8 py-6 bg-transparent"
            >
              Explore Events
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Create Events</h3>
            <p className="text-zinc-400">
              Design and host events with precise location targeting and customizable parameters.
            </p>
          </div>

          <div className="text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Location-Based</h3>
            <p className="text-zinc-400">Find events near you with intelligent radius-based discovery and mapping.</p>
          </div>

          <div className="text-center p-8 rounded-2xl border border-zinc-800 bg-zinc-900/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-black" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Build Network</h3>
            <p className="text-zinc-400">Connect with like-minded individuals and grow your professional network.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to start connecting?</h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join thousands of event creators and attendees building meaningful connections.
          </p>
          <Button size="lg" className="bg-white text-black hover:bg-zinc-200 text-lg px-8 py-6">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8">
        <div className="container mx-auto px-4 text-center text-zinc-400">
          <p>&copy; 2024 Net 0. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
