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
import ProviderProfile from "@/pages/ProviderProfile";
import SearchResults from "@/pages/SearchResults";
import Gallery from "@/pages/Gallery";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/AdminDashboard";
import Messages from "@/pages/Messages";
import TestAuth from "@/pages/TestAuth";
import AdminBootstrap from "@/pages/AdminBootstrap";
import LandingLayout from "@/components/layouts/LandingLayout";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import NewsFeed from "@/pages/NewsFeed.tsx";
import Profile from "@/pages/Profile";
// ProtectedRoutes that should use the landing page layout
const LANDING_ROUTES = ["/", "/auth"];

function ProtectedRouter() {
  return (
    <Switch>
      {/* ProtectedRoutes that should use the landing page layout */}
      <Route path="/" component={Home} />
      <Route path="/auth" component={AuthPage} />
      {/* ProtectedRoutes that should use the application layout */}
      <ProtectedRoute path="/home" component={SocialFeed} guestAllowed />
      <ProtectedRoute path="/profile" component={Profile} guestAllowed />
      <ProtectedRoute path="/marketplace" component={Marketplace} guestAllowed />
      <ProtectedRoute path="/home/products" component={Products} guestAllowed />
      <ProtectedRoute path="/home/products/create" component={CreateProduct} guestAllowed />
      <ProtectedRoute path="/home/news" component={NewsFeed} guestAllowed />
      <ProtectedRoute path="/products/:id" component={ProductDetail} guestAllowed />
      <ProtectedRoute path="/providers/:id" component={ProviderProfile} guestAllowed />
      <ProtectedRoute path="/search" component={SearchResults} guestAllowed />
      <ProtectedRoute path="/gallery" component={Gallery} guestAllowed />
      <ProtectedRoute path="/home/gallery" component={Gallery} guestAllowed />
      <ProtectedRoute path="/test-auth" component={TestAuth} guestAllowed />
      <ProtectedRoute path="/messages" component={Messages} />
      {/* Admin routes */}
      <ProtectedRoute path="/admin-bootstrap" component={AdminBootstrap} guestAllowed={false} />
      <ProtectedRoute path="/admin" component={AdminDashboard} guestAllowed={false} />
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
          <ProtectedRouter />
        </Layout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
