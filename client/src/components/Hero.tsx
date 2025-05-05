import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useGuestLogin } from "@/hooks/use-guest-login";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Hero = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const guestLoginMutation = useGuestLogin();

  const handleGuestLogin = async () => {
    await guestLoginMutation.mutateAsync();
    // Navigate to home after successful login
    navigate("/home");
  };

  return (
    <section 
      className="flex items-center justify-center" 
      style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "85vh"
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Connect with Top Interior Designers</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">The first marketplace platform connecting clients with professional interior designers and architects</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/home">
            <Button className="bg-primary text-white px-8 py-6 rounded-full text-lg font-semibold hover:bg-opacity-90 transition-all inline-block">
              Find Your Designer
            </Button>
          </Link>
          
          {!user && (
            <Button 
              variant="outline" 
              className="bg-transparent border-white text-white px-8 py-6 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all inline-block"
              onClick={handleGuestLogin}
              disabled={guestLoginMutation.isPending}
            >
              {guestLoginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login as Guest"
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
