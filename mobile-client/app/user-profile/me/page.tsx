import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Settings,
  MapPin,
  Calendar,
  ExternalLink,
  Twitter,
  Linkedin,
  User,
} from "lucide-react"

export default function UserProfile() {
  const socialLinks = [
    {
      platform: "Twitter",
      handle: "@johndoe",
      url: "https://twitter.com/johndoe",
      icon: Twitter,
    },
    {
      platform: "LinkedIn",
      handle: "john-doe",
      url: "https://linkedin.com/in/john-doe",
      icon: Linkedin,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="h-6 w-6 text-gray-400" />
            Net 0
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-800 border border-gray-600 hover:border-gray-500 transition-all duration-300"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Profile Header */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg mb-8">
          <CardContent className="p-12">
            <div className="flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="mb-8">
                <Avatar className="w-32 h-32 ring-4 ring-gray-600">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback className="text-4xl bg-gray-700 text-white font-bold">
                    JD
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Name and Title */}
              <div className="mb-8">
                <h1 className="text-5xl font-bold mb-4 text-white">
                  John Doe
                </h1>
                <p className="text-xl text-gray-300 mb-6">Product Designer & Tech Enthusiast</p>

                {/* Location and Join Date */}
                <div className="flex items-center justify-center gap-6 text-gray-400 mb-8">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined Dec 2023</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto text-lg">
                  Passionate product designer with 5+ years of experience in creating user-centered digital experiences.
                  I love connecting with fellow creatives and entrepreneurs to share ideas and collaborate on innovative
                  projects.
                </p>
              </div>

              {/* Edit Profile Button */}
              <Button className="bg-white text-black hover:bg-gray-200 font-semibold transition-all duration-300 text-lg px-8 py-3 mb-12">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Links Section */}
        <Card className="bg-gray-800 border-gray-700 shadow-lg">
          <CardContent className="p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-white">Connect With Me</h2>
              <p className="text-gray-300 text-lg">Find me on social media</p>
            </div>

            {/* Social Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {socialLinks.map((link, index) => {
                const IconComponent = link.icon
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="p-6 rounded-lg border border-gray-600 hover:border-gray-500 hover:shadow-md transition-all duration-300 transform hover:scale-105 bg-gray-700 hover:bg-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-600 rounded-lg group-hover:bg-gray-500 transition-all duration-300">
                          <IconComponent className="h-6 w-6 text-gray-200" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-lg mb-1">{link.platform}</h3>
                          <p className="text-gray-300 text-sm truncate">{link.handle}</p>
                        </div>

                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-gray-300 transition-colors duration-300" />
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
