import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Designer } from "@shared/schema";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";
import { Instagram, Twitter, Facebook, Linkedin, Youtube, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMessaging } from "@/hooks/use-messaging";

const DesignerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const designerId = parseInt(id || '0');
  const [, navigate] = useLocation();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { startConversation } = useMessaging();
  const [contactingDesigner, setContactingDesigner] = useState(false);

  const { data: designer, isLoading, error } = useQuery<Designer>({
    queryKey: [`/api/designers/${designerId}`],
    enabled: !isNaN(designerId),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !designer) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card>
          <CardContent className="py-8">
            <h1 className="text-2xl font-bold text-center">Designer not found</h1>
            <p className="text-center mt-4">
              We couldn't find the designer you're looking for. Please try again or browse our marketplace.
            </p>
            <div className="flex justify-center mt-6">
              <Button
                className="bg-primary text-white rounded-full"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-5 h-5" />,
    twitter: <Twitter className="w-5 h-5" />,
    facebook: <Facebook className="w-5 h-5" />,
    linkedin: <Linkedin className="w-5 h-5" />,
    youtube: <Youtube className="w-5 h-5" />,
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Designer Info */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center mb-6">
                <img
                  src={designer.profileImage}
                  alt={designer.name}
                  className="w-32 h-32 rounded-full object-cover mb-4"
                />
                <h1 className="text-2xl font-bold">{designer.name}</h1>
                <p className="text-gray-600 mt-1">{designer.style}</p>
                <div className="mt-2">
                  <StarRating rating={designer.rating} />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {designer.reviewCount} reviews
                </p>
                <div className="mt-4 flex items-center">
                  <span className="text-xl font-bold text-primary">${designer.hourlyRate}</span>
                  <span className="text-gray-600 ml-1">/hour</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h2 className="font-semibold mb-2">Location</h2>
                <p className="text-gray-700">{designer.location}</p>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <h2 className="font-semibold mb-2">About</h2>
                <p className="text-gray-700">{designer.description}</p>
              </div>
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <h2 className="font-semibold mb-2">Connect</h2>
                <div className="flex space-x-3 mt-2">
                  {Object.entries(designer.socialLinks as Record<string, string>).map(([platform, handle]) => (
                    <a
                      key={platform}
                      href={`#${platform}-${handle}`}
                      className="text-gray-600 hover:text-primary transition-colors"
                      aria-label={`${platform} profile`}
                    >
                      {socialIcons[platform] || platform}
                    </a>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <Button 
                  className="w-full bg-primary text-white rounded-full"
                  onClick={async () => {
                    if (isLoggedIn) {
                      setContactingDesigner(true);
                      try {
                        // We're sending the userId which is the actual user account ID
                        console.log("Messaging designer with userId:", designer.userId);
                        const success = await startConversation(designer.userId);
                        if (success) {
                          // Include the userId parameter to ensure the conversation is selected
                          navigate(`/messages?userId=${designer.userId}`);
                        } else {
                          toast({
                            title: "Error",
                            description: "Could not start a conversation with this designer. Please try again.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error("Error starting conversation:", error);
                        toast({
                          title: "Error",
                          description: "Could not start a conversation with this designer. Please try again.",
                          variant: "destructive",
                        });
                      } finally {
                        setContactingDesigner(false);
                      }
                    } else {
                      toast({
                        title: "Login required",
                        description: "You need to login to message this designer",
                        variant: "default",
                      });
                      navigate("/auth");
                    }
                  }}
                  disabled={contactingDesigner}
                >
                  {contactingDesigner ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" /> 
                      Message Designer
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Portfolio & Info Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="portfolio">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="portfolio" className="flex-1">Portfolio</TabsTrigger>
              <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
              <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {designer.portfolioImages.map((image, index) => (
                  <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Portfolio work by ${designer.name}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="services">
              <Card>
                <CardContent className="py-6">
                  <h2 className="text-xl font-bold mb-4">Services Offered</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <div>
                        <p className="font-semibold">Initial Consultation</p>
                        <p className="text-gray-600 text-sm">Understanding your needs and vision</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <div>
                        <p className="font-semibold">Concept Development</p>
                        <p className="text-gray-600 text-sm">Creating mood boards and initial designs</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <div>
                        <p className="font-semibold">Detailed Planning</p>
                        <p className="text-gray-600 text-sm">Floor plans, elevations, and 3D visualization</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <div>
                        <p className="font-semibold">Furniture & Material Selection</p>
                        <p className="text-gray-600 text-sm">Custom sourcing of furnishings and materials</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                      </svg>
                      <div>
                        <p className="font-semibold">Project Management</p>
                        <p className="text-gray-600 text-sm">Overseeing implementation and installation</p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews">
              <Card>
                <CardContent className="py-6">
                  <h2 className="text-xl font-bold mb-4">Client Reviews</h2>
                  <div className="space-y-6">
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-2">
                        <StarRating rating={5} />
                        <span className="ml-2 text-gray-600 text-sm">2 months ago</span>
                      </div>
                      <p className="font-semibold">Amazing eye for detail</p>
                      <p className="text-gray-700 mt-1">
                        Working with {designer.name} was a fantastic experience. They truly understood our vision and created a space that exceeded our expectations.
                      </p>
                    </div>
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-2">
                        <StarRating rating={4} />
                        <span className="ml-2 text-gray-600 text-sm">4 months ago</span>
                      </div>
                      <p className="font-semibold">Professional and creative</p>
                      <p className="text-gray-700 mt-1">
                        Great communication throughout the project. Would definitely recommend for anyone looking for a {designer.style.toLowerCase()} design approach.
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <StarRating rating={5} />
                        <span className="ml-2 text-gray-600 text-sm">6 months ago</span>
                      </div>
                      <p className="font-semibold">Transformed our space completely</p>
                      <p className="text-gray-700 mt-1">
                        {designer.name} has an incredible talent for maximizing space and creating the perfect atmosphere. Our home feels completely different now!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfile;
