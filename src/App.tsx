import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import DisclaimerModal from "@/components/DisclaimerModal";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import EmbedMarket from "@/pages/EmbedMarket";
import InfoPage from "@/pages/InfoPage";
import Index from "@/pages/Index";
import MarketDetail from "@/pages/MarketDetail";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppShell() {
  const location = useLocation();
  const isEmbedRoute = location.pathname.startsWith("/embed/");

  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        {!isEmbedRoute && <DisclaimerModal />}
        {!isEmbedRoute && <Header />}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/info/:slug" element={<InfoPage />} />
            <Route path="/market/:id" element={<MarketDetail />} />
            <Route path="/embed/market/:id" element={<EmbedMarket />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {!isEmbedRoute && <Footer />}
      </div>
    </AuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
