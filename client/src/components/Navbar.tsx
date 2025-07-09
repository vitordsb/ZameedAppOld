
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Home, Newspaper, Image, ShoppingBag, User, LogOut, MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import SearchBar from "@/components/SearchBar";
import logo from "../../../public/images/zameedlogo.jpg"
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn && user) {
      const fetchUnreadCount = async () => {
        try {
          const response = await fetch('/api/messages/unread/count');
          if (response.ok) {
            const data = await response.json();
            setUnreadMessages(data.count);
          }
        } catch (error) {
          console.error('Failed to fetch unread messages:', error);
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const isHomePage = location === "/";
  const textColor = isHomePage && !isScrolled ? "text-black" : "text-gray-900";

  return (
    <nav className={`fixed top-0 w-full z-50 h-16 border-b border-zinc-200 bg-white/90 backdrop-blur shadow-sm transition-all`}>  
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Zameed Logo" className="h-8 w-auto" />
            <span className={`text-lg font-bold ${textColor}`}>ZameedApp</span>
          </div>
        </Link>

        {/* Center Search */}
        {!isHomePage && (
          <div className="hidden md:block w-full max-w-md mx-8">
            <SearchBar 
              onSearch={(params) => console.log(params)} 
              placeholder="Buscar designers ou serviços..." 
              simpleNavbar 
            />
          </div>
        )}

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/home">
            <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
              <Home className="w-4 h-4" /> Início
            </div>
          </Link>
          <Link href="/home/news">
            <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
              <Newspaper className="w-4 h-4" /> Novidades
            </div>
          </Link>
          <Link href="/home/gallery">
            <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
              <Image className="w-4 h-4" /> Projetos
            </div>
          </Link>
          <Link href="/home/products">
            <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
              <ShoppingBag className="w-4 h-4" /> Produtos
            </div>
          </Link>

          {isLoggedIn && (
            <Link href="/messages">
              <div className="relative">
                <Button variant="ghost" size="icon" aria-label="Messages">
                  <MessageCircle className="h-5 w-5 text-gray-700" />
                  {unreadMessages > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </Badge>
                  )}
                </Button>
              </div>
            </Link>
          )}

          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || undefined} alt={user.username} />
                    <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                {user.userType === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <ShoppingBag className="mr-2 h-4 w-4" /> <span>Administração</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> <span>Desconectar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>Login</Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="mt-6 space-y-4">
                <Link href="/home">
                  <div className="text-gray-700 hover:text-amber-500">Início</div>
                </Link>
                <Link href="/home/news">
                  <div className="text-gray-700 hover:text-amber-500">Novidades</div>
                </Link>
                <Link href="/home/gallery">
                  <div className="text-gray-700 hover:text-amber-500">Projetos</div>
                </Link>
                <Link href="/home/products">
                  <div className="text-gray-700 hover:text-amber-500">Produtos</div>
                </Link>
                {isLoggedIn && <Button onClick={handleLogout}>Logout</Button>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

