import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CitiesProvider } from "@/contexts/CitiesContext";
import Index from "./pages/Index";
import SearchResults from "./pages/SearchResults";
import CourierProfilePage from "./pages/CourierProfile";
import CourierRegister from "./pages/CourierRegister";
import CourierLogin from "./pages/CourierLogin";
import CourierDashboard from "./pages/CourierDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import CityLanding from "./pages/CityLanding";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CitiesProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/courier/:id" element={<CourierProfilePage />} />
            <Route path="/courier/register" element={<CourierRegister />} />
            <Route path="/courier/login" element={<CourierLogin />} />
            <Route path="/courier/dashboard" element={<CourierDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/livreurs/:citySlug" element={<CityLanding />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsArticle />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CitiesProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
