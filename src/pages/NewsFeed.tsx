
import { useState, useMemo } from "react";
import { Link } from "wouter";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  Tag, 
  User, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Eye,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  SortAsc,
  SortDesc
} from "lucide-react";

// Dados expandidos das notícias
const newsArticles = [
  {
    id: "1",
    title: "As 5 Tendências de Design de Interiores para 2025",
    author: "Equipe Zameed",
    date: "15 de Junho, 2025",
    timestamp: new Date("2025-06-15"),
    category: "Tendências",
    tags: ["Design", "Interiores", "2025", "Sustentabilidade"],
    image: "https://via.placeholder.com/600x400/FFD700/FFFFFF?text=Tendencias2025",
    summary: "Descubra as principais tendências que irão moldar o design de interiores no próximo ano, desde a sustentabilidade até a tecnologia integrada.",
    views: 1250,
    likes: 89,
    comments: 23,
    readTime: "8 min",
    featured: true
  },
  {
    id: "2",
    title: "Como Contratar o Arquiteto Certo para o Seu Projeto",
    author: "Maria Silva",
    date: "10 de Junho, 2025",
    timestamp: new Date("2025-06-10"),
    category: "Dicas",
    tags: ["Arquitetura", "Contratação", "Projetos", "Dicas"],
    image: "https://via.placeholder.com/600x400/87CEEB/FFFFFF?text=ContratarArquiteto",
    summary: "Um guia completo para ajudá-lo a escolher o profissional ideal para transformar a sua visão em realidade, com dicas práticas e pontos a considerar.",
    views: 890,
    likes: 67,
    comments: 15,
    readTime: "6 min",
    featured: false
  },
  {
    id: "3",
    title: "A Revolução da IA na Arquitetura: Ferramentas e Oportunidades",
    author: "João Pereira",
    date: "05 de Junho, 2025",
    timestamp: new Date("2025-06-05"),
    category: "Tecnologia",
    tags: ["IA", "Arquitetura", "Tecnologia", "Inovação"],
    image: "https://via.placeholder.com/600x400/9370DB/FFFFFF?text=IA+Arquitetura",
    summary: "Explore como a inteligência artificial está a transformar o campo da arquitetura, desde o design generativo até a otimização de projetos.",
    views: 2100,
    likes: 156,
    comments: 42,
    readTime: "10 min",
    featured: true
  },
  {
    id: "4",
    title: "Sustentabilidade em Projetos Residenciais: Um Guia Prático",
    author: "Ana Costa",
    date: "01 de Junho, 2025",
    timestamp: new Date("2025-06-01"),
    category: "Sustentabilidade",
    tags: ["Sustentabilidade", "Residencial", "Eco-friendly", "Verde"],
    image: "https://via.placeholder.com/600x400/3CB371/FFFFFF?text=Sustentabilidade",
    summary: "Aprenda a incorporar princípios de design sustentável em sua casa, reduzindo o impacto ambiental e criando espaços mais saudáveis.",
    views: 756,
    likes: 94,
    comments: 18,
    readTime: "7 min",
    featured: false
  },
  {
    id: "5",
    title: "Iluminação Inteligente: Como Transformar Ambientes com Luz",
    author: "Carlos Mendes",
    date: "28 de Maio, 2025",
    timestamp: new Date("2025-05-28"),
    category: "Tecnologia",
    tags: ["Iluminação", "Smart Home", "Ambientes", "LED"],
    image: "https://via.placeholder.com/600x400/FF6347/FFFFFF?text=Iluminacao",
    summary: "Descubra como a iluminação inteligente pode revolucionar os seus espaços, criando ambientes adaptativos e eficientes energeticamente.",
    views: 1420,
    likes: 112,
    comments: 28,
    readTime: "9 min",
    featured: false
  },
  {
    id: "6",
    title: "Pequenos Espaços, Grandes Ideias: Maximizando Apartamentos",
    author: "Sofia Rodrigues",
    date: "25 de Maio, 2025",
    timestamp: new Date("2025-05-25"),
    category: "Dicas",
    tags: ["Pequenos Espaços", "Apartamentos", "Otimização", "Design"],
    image: "https://via.placeholder.com/600x400/20B2AA/FFFFFF?text=PequenosEspacos",
    summary: "Soluções criativas e práticas para aproveitar ao máximo cada metro quadrado do seu apartamento, sem abrir mão do estilo.",
    views: 980,
    likes: 78,
    comments: 21,
    readTime: "5 min",
    featured: false
  },
  {
    id: "7",
    title: "Materiais Inovadores na Construção Civil: O Futuro é Agora",
    author: "Ricardo Santos",
    date: "22 de Maio, 2025",
    timestamp: new Date("2025-05-22"),
    category: "Inovação",
    tags: ["Materiais", "Construção", "Inovação", "Futuro"],
    image: "https://via.placeholder.com/600x400/8A2BE2/FFFFFF?text=Materiais",
    summary: "Conheça os materiais revolucionários que estão mudando a construção civil, desde concreto auto-reparador até madeira transparente.",
    views: 1680,
    likes: 134,
    comments: 35,
    readTime: "12 min",
    featured: true
  },
  {
    id: "8",
    title: "Home Office: Criando o Espaço de Trabalho Perfeito",
    author: "Patrícia Lima",
    date: "18 de Maio, 2025",
    timestamp: new Date("2025-05-18"),
    category: "Dicas",
    tags: ["Home Office", "Trabalho", "Produtividade", "Ergonomia"],
    image: "https://via.placeholder.com/600x400/FF69B4/FFFFFF?text=HomeOffice",
    summary: "Dicas essenciais para criar um ambiente de trabalho em casa que combine produtividade, conforto e bem-estar.",
    views: 1340,
    likes: 98,
    comments: 31,
    readTime: "8 min",
    featured: false
  }
];

const categories = ["Todas", "Tendências", "Dicas", "Tecnologia", "Sustentabilidade", "Inovação"];
const sortOptions = [
  { value: "newest", label: "Mais Recentes" },
  { value: "oldest", label: "Mais Antigas" },
  { value: "popular", label: "Mais Populares" },
  { value: "trending", label: "Em Alta" }
];

export default function NewsFeed() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const articlesPerPage = 6;

  // Filtrar e ordenar artigos
  const filteredAndSortedArticles = useMemo(() => {
    let filtered = newsArticles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === "Todas" || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.timestamp.getTime() - a.timestamp.getTime();
        case "oldest":
          return a.timestamp.getTime() - b.timestamp.getTime();
        case "popular":
          return b.views - a.views;
        case "trending":
          return (b.likes + b.comments) - (a.likes + a.comments);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const paginatedArticles = filteredAndSortedArticles.slice(startIndex, startIndex + articlesPerPage);

  // Artigos em destaque
  const featuredArticles = newsArticles.filter(article => article.featured).slice(0, 3);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ApplicationLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-indigo-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Novidades e <span className="text-amber-400">Insights</span>
              </h1>
              <p className="text-xl text-amber-100 mb-8 max-w-3xl mx-auto">
                Mantenha-se atualizado com as últimas tendências, dicas e inovações no mundo da arquitetura e design
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{newsArticles.length}+</div>
                  <div className="text-amber-200">Artigos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {newsArticles.reduce((sum, article) => sum + article.views, 0).toLocaleString()}+
                  </div>
                  <div className="text-amber-200">Visualizações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{categories.length - 1}</div>
                  <div className="text-amber-200">Categorias</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Artigos em Destaque */}
          {featuredArticles.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">Em Destaque</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="overflow-hidden shadow-lg border-0 bg-white h-full">
                      <div className="relative">
                        <img src={article.image} alt={article.title} className="w-full h-48 object-cover" />
                        <Badge className="absolute top-3 left-3 bg-amber-600 text-white">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      </div>
                      <CardHeader className="p-4">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          <Link href={`/news/${article.id}`} className="hover:text-amber-600 transition-colors">
                            {article.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 line-clamp-2">
                          {article.summary}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Filtros e Pesquisa */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-amber-600" />
                    <CardTitle className="text-amber-900">Filtros e Pesquisa</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
                {/* Barra de Pesquisa */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Pesquisar artigos, tags ou autores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Filtro por Categoria */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-white border-gray-200 focus:border-amber-500">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Ordenação */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white border-gray-200 focus:border-amber-500">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Modo de Visualização */}
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="flex-1"
                    >
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Grade
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="flex-1"
                    >
                      <List className="w-4 h-4 mr-2" />
                      Lista
                    </Button>
                  </div>

                  {/* Limpar Filtros */}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("Todas");
                      setSortBy("newest");
                      setCurrentPage(1);
                    }}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    Limpar Filtros
                  </Button>
                </div>

                {/* Resultados */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
                  <span>
                    {filteredAndSortedArticles.length} artigo(s) encontrado(s)
                    {selectedCategory !== "Todas" && ` em "${selectedCategory}"`}
                  </span>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Artigos */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {paginatedArticles.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {paginatedArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: viewMode === "grid" ? 1.02 : 1.01 }}
                  >
                    <Card className={`overflow-hidden shadow-lg border-0 bg-white hover:shadow-xl transition-all duration-300 ${
                      viewMode === "list" ? "flex flex-row h-48" : "h-full"
                    }`}>
                      <div className={viewMode === "list" ? "w-1/3" : "w-full"}>
                        <img 
                          src={article.image} 
                          alt={article.title} 
                          className={`object-cover ${
                            viewMode === "list" ? "w-full h-full" : "w-full h-48"
                          }`}
                        />
                      </div>
                      
                      <div className={viewMode === "list" ? "w-2/3 flex flex-col" : ""}>
                        <CardHeader className="p-6 pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                              <Tag className="w-3 h-3 mr-1" />
                              {article.category}
                            </Badge>
                            {article.featured && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                          
                          <CardTitle className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                            <Link href={`/news/${article.id}`} className="hover:text-amber-600 transition-colors">
                              {article.title}
                            </Link>
                          </CardTitle>
                          
                          <CardDescription className="text-gray-600 text-sm flex items-center gap-4 mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" /> {article.author}
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-4 h-4" /> {article.date}
                            </span>
                          </CardDescription>
                          
                          <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                            {article.summary}
                          </p>
                        </CardHeader>
                        
                        <CardContent className="p-6 pt-0 mt-auto">
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {article.views}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                {article.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                {article.comments}
                              </span>
                            </div>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {article.readTime}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-4">
                            {article.tags.slice(0, 3).map((tag, idx) => (
                              <Badge 
                                key={idx} 
                                variant="outline" 
                                className="text-xs text-gray-500 border-gray-200"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <Link href={`/news/${article.id}`}>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                              Ler Artigo Completo
                            </Button>
                          </Link>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente ajustar os filtros ou termos de pesquisa
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Todas");
                    setSortBy("newest");
                    setCurrentPage(1);
                  }}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Limpar Filtros
                </Button>
              </motion.div>
            )}
          </motion.section>

          {/* Paginação */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex items-center justify-center gap-2 mt-12"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page 
                    ? "bg-amber-600 hover:bg-amber-700" 
                    : "border-amber-200 text-amber-600 hover:bg-amber-50"
                  }
                >
                  {page}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-amber-200 text-amber-600 hover:bg-amber-50"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </ApplicationLayout>
  );
}


