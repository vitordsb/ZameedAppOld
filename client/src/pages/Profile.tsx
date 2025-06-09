
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Designer } from "@shared/schema";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useState } from "react";
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  MessageCircle, 
  Loader2, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Star, 
  Award, 
  CheckCircle, 
  Mail, 
  Phone, 
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMessaging } from "@/hooks/use-messaging";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-16 w-16 animate-spin text-amber-600" />
      </div>
    );
  }

  if (error || !designer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg rounded-xl">
          <CardContent className="py-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Arquiteto não encontrado</h1>
            <p className="text-gray-600 mb-6">
              Não conseguimos encontrar o arquiteto que você está procurando. Por favor, tente novamente ou navegue em nosso marketplace.
            </p>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-6 py-3"
              onClick={() => navigate("/home")}
            >
              Voltar ao Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = [
    { name: "instagram", url: designer.instagramUrl, icon: <Instagram className="w-5 h-5" /> },
    { name: "twitter", url: designer.twitterUrl, icon: <Twitter className="w-5 h-5" /> },
    { name: "facebook", url: designer.facebookUrl, icon: <Facebook className="w-5 h-5" /> },
    { name: "linkedin", url: designer.linkedinUrl, icon: <Linkedin className="w-5 h-5" /> },
    { name: "youtube", url: designer.youtubeUrl, icon: <Youtube className="w-5 h-5" /> },
  ].filter(link => link.url);

  const contactInfo = [
    { type: "email", value: designer.email, icon: <Mail className="w-5 h-5 text-blue-600" /> },
    { type: "phone", value: designer.phone, icon: <Phone className="w-5 h-5 text-blue-600" /> },
    { type: "website", value: designer.website, icon: <Globe className="w-5 h-5 text-blue-600" /> },
  ].filter(info => info.value);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="relative h-48 bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center">
            <img 
              src={designer.coverImage || "https://via.placeholder.com/1200x300?text=Capa+do+Perfil"}
              alt="Cover Image"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="relative z-10 text-white text-center">
              <h1 className="text-4xl font-extrabold">{designer.name}</h1>
              <p className="text-xl mt-2 opacity-90">{designer.title || "Arquiteto Freelancer"}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start -mt-24 sm:-mt-20 relative z-20">
            <Avatar className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg flex-shrink-0">
              <AvatarImage src={designer.profileImage} alt={designer.name} />
              <AvatarFallback className="bg-amber-500 text-white text-4xl font-bold">{designer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="mt-4 sm:mt-0 sm:ml-8 text-center sm:text-left flex-grow">
              <h2 className="text-3xl font-bold text-gray-900">{designer.name}</h2>
              <p className="text-blue-600 text-lg font-medium">{designer.style || "Arquitetura Moderna"}</p>
              <div className="flex items-center justify-center sm:justify-start mt-2">
                <StarRating rating={designer.rating} />
                <span className="ml-2 text-gray-600 text-sm">({designer.reviewCount} avaliações)</span>
              </div>
              <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full">
                  <MapPin className="w-4 h-4 mr-1" /> {designer.location || 'Não informado'}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  <DollarSign className="w-4 h-4 mr-1" /> R${designer.hourlyRate}/hora
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
                  <Briefcase className="w-4 h-4 mr-1" /> {designer.experienceYears}+ Anos Exp.
                </Badge>
              </div>
              <div className="mt-6 flex justify-center sm:justify-start gap-4">
                <Button 
                  className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-6 py-3 text-lg font-semibold shadow-lg transition-all duration-300"
                  onClick={async () => {
                    if (isLoggedIn) {
                      setContactingDesigner(true);
                      try {
                        const success = await startConversation(designer.userId);
                        if (success) {
                          navigate(`/messages?userId=${designer.userId}`);
                        } else {
                          toast({
                            title: "Erro",
                            description: "Não foi possível iniciar uma conversa com este arquiteto. Tente novamente.",
                            variant: "destructive",
                          });
                        }
                      } catch (error) {
                        console.error("Erro ao iniciar conversa:", error);
                        toast({
                          title: "Erro",
                          description: "Não foi possível iniciar uma conversa com este arquiteto. Tente novamente.",
                          variant: "destructive",
                        });
                      } finally {
                        setContactingDesigner(false);
                      }
                    } else {
                      toast({
                        title: "Login Necessário",
                        description: "Você precisa estar logado para enviar uma mensagem a este arquiteto.",
                        variant: "default",
                      });
                      navigate("/auth");
                    }
                  }}
                  disabled={contactingDesigner}
                >
                  {contactingDesigner ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                      Conectando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-5 w-5" /> 
                      Enviar Mensagem
                    </>
                  )}
                </Button>
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    {socialLinks.map(link => (
                      <a 
                        key={link.name} 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-amber-600 transition-colors"
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content: About, Services, Portfolio, Reviews */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar: About and Contact */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-1 space-y-8"
          >
            <Card className="shadow-lg rounded-xl">
              <CardHeader className="border-b pb-4 mb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Sobre {designer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{designer.description || "Nenhuma descrição fornecida."}</p>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-xl">
              <CardHeader className="border-b pb-4 mb-4">
                <CardTitle className="text-xl font-bold text-gray-900">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contactInfo.length > 0 ? (
                  contactInfo.map(info => (
                    <div key={info.type} className="flex items-center gap-3 text-gray-700">
                      {info.icon}
                      {info.type === "email" ? (
                        <a href={`mailto:${info.value}`} className="hover:text-blue-600 transition-colors">
                          {info.value}
                        </a>
                      ) : info.type === "phone" ? (
                        <a href={`tel:${info.value}`} className="hover:text-blue-600 transition-colors">
                          {info.value}
                        </a>
                      ) : (
                        <a href={info.value} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                          {info.value}
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Nenhuma informação de contato disponível.</p>
                )}
              </CardContent>
            </Card>

            {designer.awards && designer.awards.length > 0 && (
              <Card className="shadow-lg rounded-xl">
                <CardHeader className="border-b pb-4 mb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Prêmios e Reconhecimentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {designer.awards.map((award, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">{award.name}</p>
                        <p className="text-sm text-gray-600">{award.year} - {award.organization}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Content: Tabs for Portfolio, Services, Reviews */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-2"
          >
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1 mb-6">
                <TabsTrigger 
                  value="portfolio" 
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 py-2"
                >
                  Portfólio
                </TabsTrigger>
                <TabsTrigger 
                  value="services" 
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 py-2"
                >
                  Serviços
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 py-2"
                >
                  Avaliações
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="portfolio">
                <Card className="shadow-lg rounded-xl">
                  <CardHeader className="border-b pb-4 mb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Projetos Recentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {designer.portfolioImages && designer.portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                        {designer.portfolioImages.map((image, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="aspect-video relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                          >
                            <img
                              src={image}
                              alt={`Portfolio work by ${designer.name}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                              <span className="text-white text-lg font-semibold">Ver Projeto</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <p>Nenhum projeto de portfólio disponível no momento.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="services">
                <Card className="shadow-lg rounded-xl">
                  <CardHeader className="border-b pb-4 mb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Serviços Oferecidos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {designer.services && designer.services.length > 0 ? (
                      <ul className="space-y-4">
                        {designer.services.map((service, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                            <div>
                              <p className="font-semibold text-gray-900">{service}</p>
                              <p className="text-gray-600 text-sm">Descrição detalhada do serviço de {service.toLowerCase()}.</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <p>Nenhum serviço listado no momento.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card className="shadow-lg rounded-xl">
                  <CardHeader className="border-b pb-4 mb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Avaliações de Clientes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {designer.reviews && designer.reviews.length > 0 ? (
                      <div className="space-y-6">
                        {designer.reviews.map((review, index) => (
                          <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                            <div className="flex items-center mb-2">
                              <StarRating rating={review.rating} />
                              <span className="ml-3 text-gray-600 text-sm">{review.date}</span>
                            </div>
                            <p className="font-semibold text-gray-900 mb-1">{review.title}</p>
                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-2">- {review.clientName}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <p>Nenhuma avaliação disponível no momento.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DesignerProfile;



