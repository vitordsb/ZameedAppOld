import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Star, 
  Search, 
  MapPin, 
  Briefcase, 
  Award, 
  Filter,
  MessageCircle,
  Users,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";

const locations = [
  { label: "São Paulo", value: "sao-paulo" },
  { label: "Rio de Janeiro", value: "rio-de-janeiro" },
  { label: "Belo Horizonte", value: "belo-horizonte" },
  { label: "Curitiba", value: "curitiba" },
  { label: "Porto Alegre", value: "porto-alegre" },
];

const servicesList = [
  "Design de Interiores",
  "Renderização 3D",
  "Planejamento de Espaço",
  "Consultoria de Cores",
  "Design Comercial",
];

export default function SaaSProfessionalDirectory() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState("");
  const [service, setService] = useState("");
  const { data: providers = [] } = useQuery<provider[]>({
    queryKey: ["/providers"],
  });

  const filtered = providers.filter((d) => {
    console.log(d)
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = !location || d.location?.toLowerCase() === location.toLowerCase();
    const matchesRating = !rating || (d.rating && d.rating >= parseFloat(rating));
  });

  return (
    <ApplicationLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl md:text-6xl font-bold mb-6"
              >
                Encontre o <span className="text-amber-400">Arquiteto Ideal</span>
                <br />para o Seu Projeto
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-amber-100 mb-8 max-w-3xl mx-auto"
              >
                Conectamos você aos melhores talentos em arquitetura, de forma rápida e segura. 
                Mais de 500+ profissionais verificados prontos para transformar suas ideias em realidade.
              </motion.p>
              
              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-amber-400 mr-2" />
                    <span className="text-3xl font-bold">500+</span>
                  </div>
                  <p className="text-amber-200">Arquitetos Verificados</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-8 h-8 text-amber-400 mr-2" />
                    <span className="text-3xl font-bold">2.5k+</span>
                  </div>
                  <p className="text-amber-200">Projetos Concluídos</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-8 h-8 text-amber-400 mr-2" />
                    <span className="text-3xl font-bold">98%</span>
                  </div>
                  <p className="text-amber-200">Satisfação do Cliente</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="mb-12 shadow-xl border-0 bg-white/80 backdrop-amber-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-5 h-5 text-amber-600" />
                  <CardTitle className="text-amber-900">Encontre o Profissional Perfeito</CardTitle>
                </div>
                <CardDescription>
                  Use os filtros abaixo para encontrar arquitetos que atendam exatamente às suas necessidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nome ou especialidade"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Select onValueChange={setLocation} value={location}>
                      <SelectTrigger className="pl-10 bg-white border-gray-200 focus:border-amber-500">
                        <SelectValue placeholder="Localização" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Select onValueChange={setService} value={service}>
                      <SelectTrigger className="pl-10 bg-white border-gray-200 focus:border-amber-500">
                        <SelectValue placeholder="Serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesList.map((svc) => (
                          <SelectItem key={svc} value={svc}>
                            {svc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                    <Select onValueChange={setRating} value={rating}>
                      <SelectTrigger className="pl-10 bg-white border-gray-200 focus:border-amber-500">
                        <SelectValue placeholder="Avaliação mínima" />
                      </SelectTrigger>
                      <SelectContent>
                        {["3", "4", "4.5"].map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}+ estrelas
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {(search || location || service || rating) && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-gray-600">Filtros ativos:</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setLocation("");
                        setService("");
                        setRating("");
                      }}
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      Limpar todos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Lista de providers */}
            <section className="lg:col-span-3">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filtered.length} Arquitetos Encontrados
                </h2>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 px-3 py-1">
                  Todos Verificados
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((d, index) => (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: '0px 20px 40px rgba(0,0,0,0.1)' 
                    }}
                    className="group"
                  >
                    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-50 p-6">
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="w-16 h-16 ring-4 ring-white shadow-lg">
                              <AvatarImage src={d.profileImage} />
                              <AvatarFallback className="bg-gradient-to-br from-amber-500 to-amber-600 text-white text-lg font-semibold">
                                {d.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 mb-1 group-hover:text-amber-600 transition-colors">
                              {d.name}
                            </CardTitle>
                            <CardDescription className="text-gray-600 mb-2">
                              {d.title || "Arquiteto Profissional"}
                            </CardDescription>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-current" />
                              <span className="font-semibold text-gray-900">
                                {d.rating ? d.rating.toFixed(1) : "5.0"}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">
                                (50+ avaliações)
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-amber-600" />
                            Especialidades
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {d.services?.slice(0, 3).map((service, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                              >
                                {service}
                              </Badge>
                            ))}
                            {d.services && d.services.length > 3 && (
                              <Badge variant="outline" className="text-gray-500">
                                +{d.services.length - 3} mais
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{d.location || 'Localização não informada'}</span>
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Link href={`/designer/${d.id}`} className="flex-1">
                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-all duration-200 group-hover:bg-amber-700">
                              Ver Perfil Completo
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="border-amber-200 text-amber-600 hover:bg-amber-50 rounded-xl"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              {filtered.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum arquiteto encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tente ajustar os filtros ou remover algumas restrições de busca
                  </p>
                  <Button 
                    onClick={() => {
                      setSearch("");
                      setLocation("");
                      setService("");
                      setRating("");
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Limpar Filtros
                  </Button>
                </motion.div>
              )}
            </section>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Premium Features */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-600" />
                      <CardTitle className="text-amber-800">Recursos Premium</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Contratação Expressa</h4>
                        <p className="text-xs text-gray-600">Conecte-se instantaneamente com arquitetos disponíveis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Garantia de Qualidade</h4>
                        <p className="text-xs text-gray-600">100% dos profissionais são verificados e avaliados</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Suporte 24/7</h4>
                        <p className="text-xs text-gray-600">Assistência completa durante todo o projeto</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Destaques */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-600" />
                      <CardTitle className="text-amber-900">Destaques da Semana</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {anuncios.map((a) => (
                      <div key={a.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <h4 className="font-semibold text-amber-900 mb-1 text-sm">{a.titulo}</h4>
                        <p className="text-amber-700 text-xs">{a.descricao}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* CTA Support */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <Card className="bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-xl border-0">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white mb-3 text-lg">
                      Precisa de Ajuda?
                    </CardTitle>
                    <CardDescription className="text-amber-100 text-sm mb-4">
                      Nossa equipe especializada está pronta para ajudar você a encontrar o arquiteto perfeito para seu projeto.
                    </CardDescription>
                    <Button className="w-full bg-white text-amber-600 hover:bg-amber-50 font-semibold py-2.5 rounded-xl transition-all duration-200">
                      Falar com Especialista
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </aside>
          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
}

// Dados de anúncios
const anuncios = [
  {
    id: 1,
    titulo: "Projeto Residencial Premium",
    descricao: "20% de desconto para projetos residenciais acima de R$ 50k.",
  },
  {
    id: 2,
    titulo: "Consultoria Gratuita",
    descricao: "Primeira consulta sem custo para novos clientes.",
  },
  {
    id: 3,
    titulo: "Pacote Comercial",
    descricao: "Soluções completas para ambientes corporativos.",
  },
];


