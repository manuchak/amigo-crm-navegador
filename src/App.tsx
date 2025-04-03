
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
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import PendingApproval from "./pages/PendingApproval";
import Unauthorized from "./pages/Unauthorized";
import UserManagement from "./pages/UserManagement";
import AuthGuard from "./components/auth/AuthGuard";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <LeadsProvider>
              <Toaster />
              <Sonner />
              {/* Only show navbar on non-landing pages */}
              <Routes>
                <Route path="/custodios" element={<Landing />} />
                <Route path="*" element={<AppWithNavbar />} />
              </Routes>
            </LeadsProvider>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// Component that wraps routes that need the navbar
const AppWithNavbar = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        } />
        
        <Route path="/leads" element={
          <AuthGuard allowedRoles={['atención_afiliado', 'admin', 'owner']}>
            <Leads />
          </AuthGuard>
        } />
        
        <Route path="/requerimientos" element={
          <AuthGuard allowedRoles={['supply', 'supply_admin', 'admin', 'owner']}>
            <Requerimientos />
          </AuthGuard>
        } />
        
        <Route path="/admin-config" element={
          <AuthGuard allowedRoles={['admin', 'owner']}>
            <AdminConfig />
          </AuthGuard>
        } />
        
        <Route path="/user-management" element={
          <AuthGuard allowedRoles={['admin', 'owner']}>
            <UserManagement />
          </AuthGuard>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
