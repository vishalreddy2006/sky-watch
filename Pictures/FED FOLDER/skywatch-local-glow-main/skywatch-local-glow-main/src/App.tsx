import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TestApp from "./pages/TestApp";

const queryClient = new QueryClient();

/**
 * SkyWatch Weather Application
 * 
 * @author Vishal Reddy
 * @date October 6, 2025
 * @version 1.0.0
 * @description Personal weather dashboard with real-time data
 * @location c:\Users\k.vishal reddy\Downloads\skywatch-local-glow-main\skywatch-local-glow-main\
 * @server http://localhost:8080/
 */

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/test" element={<TestApp />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
