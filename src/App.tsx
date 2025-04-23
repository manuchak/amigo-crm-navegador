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
import Unauthorized from "./pages/Unauthorized";
import UserManagement from "./pages/UserManagement";
import AuthGuard from "./components/auth/AuthGuard";
import Landing from "./pages/Landing";
import AtencionAlAfiliado from "./pages/Support";
import InstalacionGPS from "./pages/InstalacionGPS";
import InstalacionGPSInstallers from "./pages/InstalacionGPSInstallers";
import InstaladorRegistro from "./pages/InstaladorRegistro";
import InstalacionesAgendadas from "./pages/InstalacionesAgendadas";
import Performance from "./pages/Performance";

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

const AppWithNavbar = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

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

        <Route path="/instalacion-gps/instaladores" element={
          <AuthGuard allowedRoles={['admin', 'owner']}>
            <InstalacionGPSInstallers />
          </AuthGuard>
        } />

        <Route path="/instalacion-gps/registro-instalador" element={
          <AuthGuard allowedRoles={['admin', 'owner']}>
            <InstaladorRegistro />
          </AuthGuard>
        } />

        <Route path="/instalacion-gps" element={
          <AuthGuard>
            <InstalacionGPS />
          </AuthGuard>
        } />

        <Route path="/support" element={
          <AuthGuard>
            <AtencionAlAfiliado />
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

        <Route path="/instalacion-gps/agendadas" element={
          <AuthGuard>
            <InstalacionesAgendadas />
          </AuthGuard>
        } />

        <Route path="/performance" element={
          <AuthGuard>
            <Performance />
          </AuthGuard>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
