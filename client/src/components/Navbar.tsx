import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Search, Home, Newspaper, Image, Video, ShoppingBag, User, LogOut, MessageCircle, Bell } from "lucide-react";
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
import ProfileDropdown from "@/components/ProfileDropdown";
import SearchBar from "@/components/SearchBar";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  // Handle navbar transparency on scroll

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Fetch unread message count when user is logged in
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
      
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, user]);
  
  // Handle authentication
  const handleLoginClick = () => {
    navigate("/auth");
  };
  
  const handleLogout = async () => {
    await logout();
    // After logout, stay on the same page
  };

  // Determine navbar style based on location and scroll state
  const isHomePage = location === "/";
  const isMarketplace = location.startsWith("/home");
  
  // Apply transparent navbar for homepage when not scrolled
  const navClass = (isHomePage && !isScrolled) 
    ? "bg-transparent" 
    : "bg-white bg-opacity-95 shadow-md";

  // Handler for the search functionality
  const handleSearch = (searchParams: { query: string, location: string, service: string }) => {
    console.log("Searching for:", searchParams);
    // This would typically dispatch an action or update state in a real app
  };

  // Auth button or user dropdown
  const renderAuthSection = () => {
    if (isLoggedIn && user) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage || undefined} alt={user.username} />
                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.username}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            {user.userType === 'admin' && (
              <DropdownMenuItem asChild>
                <Link href="/admin">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          onClick={handleLoginClick} 
          className="text-sm font-medium">
          Login
        </Button>
        <Button 
          onClick={handleLoginClick}
          className="text-sm">
          Sign Up
        </Button>
      </div>
    );
  };

  // Render messaging icon for logged-in users
  const renderMessagingIcon = () => {
    if (!isLoggedIn || !user) return null;
    
    return (
      <Link href="/messages">
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative" aria-label="Messages">
            <MessageCircle className="h-5 w-5" />
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
    );
  };

  // LANDING PAGE NAVBAR - Used on the homepage
  const renderLandingDesktopNav = () => {
    return (
      <div className="hidden md:flex items-center space-x-8">
        <Link href="/#how-it-works">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer">How It Works</span>
        </Link>
        <Link href="/#benefits">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer">Benefits</span>
        </Link>
        <Link href="/#testimonials">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer">Testimonials</span>
        </Link>
        <Link href="/marketplace">
          <Button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-all font-semibold">
            Explore Marketplace
          </Button>
        </Link>
        <div className="ml-6 flex items-center space-x-3">
          {isLoggedIn && renderMessagingIcon()}
          {renderAuthSection()}
        </div>
      </div>
    );
  };

  // LANDING PAGE MOBILE MENU
  const renderLandingMobileNav = () => {
    return (
      <div className="flex flex-col space-y-4 mt-8">
        <Link href="/#how-it-works">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer block">
            How It Works
          </span>
        </Link>
        <Link href="/#benefits">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer block">
            Benefits
          </span>
        </Link>
        <Link href="/#testimonials">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer block">
            Testimonials
          </span>
        </Link>
        <Link href="/home">
          <Button className="w-full bg-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all font-semibold mt-2">
            Explore Marketplace
          </Button>
        </Link>
        
        {renderMobileAuthSection()}
      </div>
    );
  };

  // APPLICATION NAVBAR - Used on marketplace and other app pages
  const renderApplicationDesktopNav = () => {
    return (
      <div className="hidden md:flex items-center justify-end space-x-6">
        <Link href="/home">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Home className="w-4 h-4 mr-1" /> Home
          </span>
        </Link>
        <Link href="/home/news">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Newspaper className="w-4 h-4 mr-1" /> News
          </span>
        </Link>
        <Link href="/home/gallery">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Image className="w-4 h-4 mr-1" /> Gallery
          </span>
        </Link>
        <Link href="/home/videos">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Video className="w-4 h-4 mr-1" /> Videos
          </span>
        </Link>
        <Link href="/home/products">
          <span className="text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <ShoppingBag className="w-4 h-4 mr-1" /> Products
          </span>
        </Link>
        {isLoggedIn && renderMessagingIcon()}
        {renderAuthSection()}
      </div>
    );
  };

  // APPLICATION MOBILE MENU
  const renderApplicationMobileNav = () => {
    return (
      <div className="flex flex-col space-y-4 mt-8">
        <div className="mb-4">
          <SearchBar onSearch={handleSearch} placeholder="Search..." simpleNavbar={true} />
        </div>
        
        <Link href="/home">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Home className="w-4 h-4 mr-2" /> Home
          </span>
        </Link>
        <Link href="/home/news">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Newspaper className="w-4 h-4 mr-2" /> News
          </span>
        </Link>
        <Link href="/home/gallery">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Image className="w-4 h-4 mr-2" /> Gallery
          </span>
        </Link>
        <Link href="/home/videos">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <Video className="w-4 h-4 mr-2" /> Videos
          </span>
        </Link>
        <Link href="/home/products">
          <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
            <ShoppingBag className="w-4 h-4 mr-2" /> Products
          </span>
        </Link>
        
        {renderMobileAuthSection()}
      </div>
    );
  };

  // Mobile auth section - reused by both navbar types
  const renderMobileAuthSection = () => {
    if (isLoggedIn && user) {
      return (
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileImage || undefined} alt={user.username} />
              <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <div className="font-medium">{user.username}</div>
              <div className="text-gray-500">{user.email}</div>
            </div>
          </div>
          
          <Link href="/profile">
            <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
              <User className="w-4 h-4 mr-2" /> Profile
            </span>
          </Link>
          
          {user.userType === 'admin' && (
            <Link href="/admin">
              <span className="py-2 text-gray-800 hover:text-primary transition-colors cursor-pointer flex items-center">
                <ShoppingBag className="w-4 h-4 mr-2" /> Admin Dashboard
              </span>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left py-2 px-0 hover:bg-transparent hover:text-primary"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Log out
          </Button>
        </div>
      );
    }

    return (
      <div className="border-t pt-4 mt-4">
        <Button onClick={handleLoginClick} className="w-full mb-2">
          Login
        </Button>
        <Button onClick={handleLoginClick} variant="outline" className="w-full">
          Sign Up
        </Button>
      </div>
    );
  };

  // Decide which desktop navigation to render based on the current page
  const renderDesktopNavItems = () => {
    return isHomePage 
      ? renderLandingDesktopNav() 
      : renderApplicationDesktopNav();
  };

  // Decide which mobile navigation to render based on the current page
  const renderMobileNavItems = () => {
    return isHomePage 
      ? renderLandingMobileNav() 
      : renderApplicationMobileNav();
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${navClass}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo - common to both navbar types */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center justify-center bg-primary text-white rounded-md w-8 h-8 font-bold text-lg">
                Z
              </div>
            </Link>
          </div>
          
          {/* Search Bar - only for application navbar */}
          {!isHomePage && (
            <div className="hidden md:flex items-center flex-1 justify-center max-w-md mx-4">
              <SearchBar 
                onSearch={handleSearch} 
                placeholder="Search designers, projects, or posts..." 
                simpleNavbar={true} 
              />
            </div>
          )}
          
          {/* Dynamic Navigation Items */}
          {renderDesktopNavItems()}
          
          {/* Mobile Menu Button - common to both navbar types */}
          <div className="block md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                {renderMobileNavItems()}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
