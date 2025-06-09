import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SocialFeed from "@/pages/SocialFeed";
import Marketplace from "@/pages/Marketplace";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import CreateProduct from "@/pages/CreateProduct";
import DesignerProfile from "@/pages/DesignerProfile";
import SearchResults from "@/pages/SearchResults";
import Gallery from "@/pages/Gallery";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/AdminDashboard";
import Messages from "@/pages/Messages";
import TestAuth from "@/pages/TestAuth";
import AdminBootstrap from "@/pages/AdminBootstrap";
import LandingLayout from "@/components/layouts/LandingLayout";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import Profile from "@/pages/Profile";
// Routes that should use the landing page layout
const LANDING_ROUTES = ["/"];

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={SocialFeed} />
      <Route path="/profile" component={Profile} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/home/products" component={Products} />
      <Route path="/home/products/create" component={CreateProduct} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/designer/:id" component={DesignerProfile} />
      <Route path="/search" component={SearchResults} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/home/gallery" component={Gallery} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/test-auth" component={TestAuth} />
      <Route path="/admin-bootstrap" component={AdminBootstrap} />
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/messages" component={Messages} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isLandingPage = LANDING_ROUTES.includes(location);
  const Layout = isLandingPage ? LandingLayout : ApplicationLayout;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
