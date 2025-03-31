
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Requerimientos from "./pages/Requerimientos";
import AdminConfig from "./pages/AdminConfig";
import NotFound from "./pages/NotFound";
import { LeadsProvider } from "./context/LeadsContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <LeadsProvider>
            <Toaster />
            <Sonner />
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/requerimientos" element={<Requerimientos />} />
              <Route path="/admin-config" element={<AdminConfig />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LeadsProvider>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
