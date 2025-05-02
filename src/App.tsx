
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context'; 
import { LeadsProvider } from '@/context/LeadsContext';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/Navbar';
import './App.css';

// Create a React Query client
const queryClient = new QueryClient();

// Import all pages directly to avoid dynamic import issues
import Index from './pages/Index';
import Dashboard from './pages/Dashboard'; 
import UserManagement from './pages/UserManagement';
import InstalacionGPS from './pages/InstalacionGPS';
import InstalacionesAgendadas from './pages/InstalacionesAgendadas';
import InstalacionGPSInstallers from './pages/InstalacionGPSInstallers';
import InstaladorRegistro from './pages/InstaladorRegistro';
import Performance from './pages/Performance';
import Leads from './pages/Leads';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Prospects from './pages/Prospects';
import Validation from './pages/Validation';
import Support from './pages/Support';
import CallCenter from './pages/CallCenter';
import Settings from './pages/Settings';
import Requerimientos from './pages/Requerimientos';
import AdminConfig from './pages/AdminConfig';

function App() {
  console.log("App rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LeadsProvider>
          <Router>
            <Navbar />
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                
                {/* Add the route for the Index/Inicio page */}
                <Route path="/inicio" element={<Index />} />
                <Route path="/" element={<Index />} />
                
                {/* UserManagement - directly imported */}
                <Route path="/user-management" element={
                  <AuthGuard>
                    <UserManagement />
                  </AuthGuard>
                } />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } />
                <Route path="/leads" element={
                  <AuthGuard>
                    <Leads />
                  </AuthGuard>
                } />
                <Route path="/prospects" element={
                  <AuthGuard>
                    <Prospects />
                  </AuthGuard>
                } />
                <Route path="/validation" element={
                  <AuthGuard>
                    <Validation />
                  </AuthGuard>
                } />
                <Route path="/support" element={
                  <AuthGuard>
                    <Support />
                  </AuthGuard>
                } />
                <Route path="/call-center" element={
                  <AuthGuard>
                    <CallCenter />
                  </AuthGuard>
                } />
                <Route path="/settings" element={
                  <AuthGuard>
                    <Settings />
                  </AuthGuard>
                } />
                
                {/* GPS Installation routes - Now using direct imports */}
                <Route path="/instalacion-gps" element={
                  <AuthGuard>
                    <InstalacionGPS />
                  </AuthGuard>
                } />
                <Route path="/instalacion-gps/agendadas" element={
                  <AuthGuard>
                    <InstalacionesAgendadas />
                  </AuthGuard>
                } />
                <Route path="/instalacion-gps/instaladores" element={
                  <AuthGuard>
                    <InstalacionGPSInstallers />
                  </AuthGuard>
                } />
                <Route path="/instalacion-gps/registro-instalador" element={
                  <AuthGuard>
                    <InstaladorRegistro />
                  </AuthGuard>
                } />
                
                {/* Performance route */}
                <Route path="/performance" element={
                  <AuthGuard>
                    <Performance />
                  </AuthGuard>
                } />
                
                <Route path="/requerimientos" element={
                  <AuthGuard>
                    <Requerimientos />
                  </AuthGuard>
                } />
                <Route path="/admin-config" element={
                  <AuthGuard>
                    <AdminConfig />
                  </AuthGuard>
                } />
                
                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster position="top-right" richColors closeButton />
        </LeadsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
