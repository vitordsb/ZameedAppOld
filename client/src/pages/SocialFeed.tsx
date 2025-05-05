import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Designer } from "@shared/schema";
import { MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import NewsCarousel from "@/components/NewsCarousel";
import { useAuth } from "@/hooks/use-auth";

// Available services
const serviceOptions = [
  "Interior Design",
  "Custom Furniture",
  "Space Planning",
  "3D Rendering",
  "Lighting Design",
  "Color Consultation",
  "Home Staging",
  "Commercial Design"
];

const SocialFeed = () => {
  const { user } = useAuth();
  const [designerSearchQuery, setDesignerSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Fetch designers data
  const { data: designers = [] } = useQuery<Designer[]>({
    queryKey: ["/api/designers"],
  });

  // Filter designers based on search and selected service
  const filteredDesigners = designers.filter(designer => {
    const matchesSearch = designerSearchQuery === "" || 
      designer.name.toLowerCase().includes(designerSearchQuery.toLowerCase());
    
    const matchesService = !selectedService || 
      (designer.services && designer.services.includes(selectedService));
    
    return matchesSearch && matchesService;
  });

  // Handle service selection
  const handleServiceClick = (service: string) => {
    setSelectedService(selectedService === service ? null : service);
  };

  return (
    <ApplicationLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="md:col-span-2 space-y-8">
            {/* Designer Feed Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Designer Feed</h2>
              <Card className="shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-sm text-gray-500 mb-3">
                    Discover the latest from top interior designers
                  </p>
                  {/* Designer feed content here */}
                  <div className="space-y-4">
                    {/* This would be populated with actual feed items */}
                    <p className="text-muted-foreground">
                      Coming soon: Posts from your favorite designers will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Find Designers Section */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Find Designers</h2>
              <Card className="shadow-sm">
                <CardContent className="pt-5 space-y-4">
                  {/* Location Selector */}
                  <div>
                    <label className="block text-sm mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input 
                        className="pl-10 pr-8" 
                        placeholder="Select a location" 
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1L5 5L9 1" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Search Box */}
                  <div>
                    <label className="block text-sm mb-2">Search</label>
                    <div className="flex">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          className="pl-10 rounded-r-none"
                          placeholder="Find designers by name, specialty, style..."
                          value={designerSearchQuery}
                          onChange={(e) => setDesignerSearchQuery(e.target.value)}
                        />
                      </div>
                      <Link href="/search">
                        <Button type="button" className="bg-rose-500 hover:bg-rose-600 rounded-l-none h-10">
                          <Search className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm mb-2">Service</label>
                    <div className="flex flex-wrap gap-2">
                      {serviceOptions.map(service => (
                        <Badge
                          key={service}
                          variant={selectedService === service ? "default" : "outline"}
                          className="cursor-pointer rounded-full px-3 py-1 text-xs"
                          onClick={() => handleServiceClick(service)}
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="mt-6">
                    <h3 className="text-sm mb-3">Suggestions</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {filteredDesigners.slice(0, 3).map(designer => (
                        <Link key={designer.id} href={`/designer/${designer.id}`}>
                          <div className="cursor-pointer transition-transform hover:scale-[1.02]">
                            {/* Designer project image */}
                            <div className="relative mb-2">
                              {/* Sample project image - replace with actual designer project images */}
                              <img 
                                src={`https://source.unsplash.com/featured/600x400?interior,${designer.id}`}
                                alt="Designer project" 
                                className="w-full h-32 sm:h-40 object-cover rounded-lg"
                              />
                              {/* Designer profile image overlay */}
                              <div className="absolute left-3 bottom-3">
                                <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-200">
                                  {designer.profileImage ? (
                                    <img 
                                      src={designer.profileImage} 
                                      alt={designer.name} 
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary text-white font-medium text-xs">
                                      {designer.name.charAt(0)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            {/* Designer info */}
                            <div className="text-left">
                              <h4 className="font-medium text-xs">{designer.name}</h4>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">{designer.title || designer.style || "Architect"}</p>
                                <div className="flex items-center text-amber-500 text-xs">
                                  <span>★</span>
                                  <span className="ml-1">{designer.rating || (4 + Math.random()).toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Social Media Feed */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Recent Posts</h2>
              <div className="space-y-4">
                {/* Post 1 */}
                <Card className="shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          <img 
                            src="https://source.unsplash.com/featured/100x100?person,1" 
                            alt="User"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Sarah Chen</h4>
                          <p className="text-xs text-gray-500">Senior Architect • 2 hours ago</p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">Just finished this amazing modern kitchen renovation project! The client wanted a minimalist design with sustainable materials.</p>
                      <div className="rounded-md overflow-hidden mb-3">
                        <img 
                          src="https://source.unsplash.com/featured/800x600?kitchen,modern" 
                          alt="Kitchen design" 
                          className="w-full h-64 object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 hover:text-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            <span>143 likes</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <span>24 comments</span>
                          </button>
                        </div>
                        <button className="hover:text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Post 2 */}
                <Card className="shadow-sm overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                          <img 
                            src="https://source.unsplash.com/featured/100x100?person,2" 
                            alt="User"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Michael Torres</h4>
                          <p className="text-xs text-gray-500">Architectural Designer • 5 hours ago</p>
                        </div>
                      </div>
                      <p className="text-sm mb-3">Excited to share my latest office space transformation! We focused on bringing natural light and incorporating biophilic design principles.</p>
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <img 
                          src="https://source.unsplash.com/featured/400x300?office,design,1" 
                          alt="Office design" 
                          className="w-full h-40 object-cover rounded-md"
                        />
                        <img 
                          src="https://source.unsplash.com/featured/400x300?office,plants,1" 
                          alt="Office with plants" 
                          className="w-full h-40 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 hover:text-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                            <span>89 likes</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-gray-700">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <span>12 comments</span>
                          </button>
                        </div>
                        <button className="hover:text-gray-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Latest News Section */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Latest News</h2>
                <Link href="/news" className="text-sm text-rose-500 hover:text-rose-700">
                  View all
                </Link>
              </div>
              <Card className="shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <NewsCarousel />
                </CardContent>
              </Card>
            </div>

            {/* Welcome Card */}
            <Card className="shadow-sm">
              <CardContent className="pt-5 px-4">
                <h3 className="font-semibold mb-1">
                  Welcome, {user ? user.username : "Guest"}!
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {user 
                    ? "You are now logged in as a user."
                    : "You are now browsing as a guest user."
                  }
                </p>
                {!user && (
                  <Link href="/auth">
                    <Button size="sm" className="w-full bg-rose-500 hover:bg-rose-600">Login / Sign Up</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
};

export default SocialFeed;