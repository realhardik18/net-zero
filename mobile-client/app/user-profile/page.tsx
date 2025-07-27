import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, MapPin, Calendar, Users, ExternalLink, Twitter, Linkedin } from "lucide-react"

export default function UserProfile() {
  const attendedEvents = [
    {
      id: 1,
      name: "Tech Networking Mixer",
      date: "Dec 15, 2024",
      location: "Downtown SF",
      host: "Sarah Chen",
      tags: ["Tech", "Networking"],
    },
    {
      id: 2,
      name: "Design Workshop",
      date: "Dec 10, 2024",
      location: "SOMA",
      host: "Mike Johnson",
      tags: ["Design", "Workshop"],
    },
    {
      id: 3,
      name: "Startup Founders Meetup",
      date: "Nov 28, 2024",
      location: "Mission Bay",
      host: "Alex Rivera",
      tags: ["Startup", "Founders"],
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">Net 0</div>
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">John Doe</h1>
                <p className="text-zinc-400 mb-4">Product Designer & Tech Enthusiast</p>

                <div className="flex items-center gap-4 mb-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined Dec 2023</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    @johndoe
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 bg-transparent"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    john-doe
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </div>
              </div>

              <Button className="bg-white text-black hover:bg-zinc-200">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Events Attended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-zinc-400 mt-1">+3 this month</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Events Hosted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">8</div>
              <p className="text-xs text-zinc-400 mt-1">2 upcoming</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400">Connections Made</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">156</div>
              <p className="text-xs text-zinc-400 mt-1">+12 this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Bio Section */}
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-300 leading-relaxed">
              Passionate product designer with 5+ years of experience in creating user-centered digital experiences. I
              love connecting with fellow creatives and entrepreneurs to share ideas and collaborate on innovative
              projects. Always excited to attend events that focus on design, technology, and startup culture.
            </p>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Recent Events Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-800/50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{event.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Hosted by {event.host}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
