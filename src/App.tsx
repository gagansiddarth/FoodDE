import { Toaster } from "@/shared/components/ui/toaster";
import { Toaster as Sonner } from "@/shared/components/ui/sonner";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/features/health-score/Index.tsx";
import { NotFound, SiteHeader, SiteFooter, HowItWorks, Help, Terms, Privacy } from "@/shared/components";
import Auth from "@/features/auth/Auth.tsx";
import Profile from "@/features/profile/Profile.tsx";
import Saved from "@/features/saved/Saved.tsx";
import { ThemeProvider } from "@/shared/contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scan" element={<Index initialTab="scan" />} />
            <Route path="/results" element={<Index initialTab="results" />} />
            <Route path="/chat" element={<Index initialTab="chat" />} />
            <Route path="/history" element={<Index initialTab="history" />} />
            <Route path="/community" element={<Index initialTab="community" />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/help" element={<Help />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <SiteFooter />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
