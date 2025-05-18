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
    navigate("/home");
  };

  return (
    <section 
      className="flex items-center justify-center" 
      style={{ 
        backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.9)), url('https://www.weg.net/weghome/wp-content/uploads/2017/12/arquitetura-e-urbanismo.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "85vh"
      }}
    >
      <div className="container mx-auto px-4 text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Seja um freelancer de sucesso com a plataforma ZameedApp</h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">O melhor lugar para encontrar profissionais de design e arquitetura para os seus projetos.</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href="/home">
            <Button className="bg-amber-500 text-white px-8 py-6 rounded-full text-lg font-semibold hover:bg-amber-600 transition-all flex">
              Encontre um projetista
            </Button>
          </Link>
          
          {!user && (
            <Button 
              variant="outline" 
              className="bg-transparent border-white text-white px-8 py-6 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all flex"
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
