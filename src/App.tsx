
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context'; // Import from the updated location
import { LeadsProvider } from '@/context/LeadsContext';
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/Navbar';
import './App.css';

// Create a React Query client
const queryClient = new QueryClient();

// Lazy load routes for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Login = React.lazy(() => import('./pages/Login')); 
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const Leads = React.lazy(() => import('./pages/Leads'));
const Prospects = React.lazy(() => import('./pages/Prospects'));
const Validation = React.lazy(() => import('./pages/Validation'));
const Support = React.lazy(() => import('./pages/Support'));
const CallCenter = React.lazy(() => import('./pages/CallCenter'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Index = React.lazy(() => import('./pages/Index')); // Import the Index page
const Performance = React.lazy(() => import('./pages/Performance'));
const Requerimientos = React.lazy(() => import('./pages/Requerimientos'));
const AdminConfig = React.lazy(() => import('./pages/AdminConfig'));
const InstalacionGPS = React.lazy(() => import('./pages/InstalacionGPS'));

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
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <AuthGuard>
                    <Dashboard />
                  </AuthGuard>
                } />
                <Route path="/user-management" element={
                  <AuthGuard>
                    <UserManagement />
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
                
                {/* Rutas para las páginas que mencionó el usuario */}
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
                <Route path="/instalacion-gps" element={
                  <AuthGuard>
                    <InstalacionGPS />
                  </AuthGuard>
                } />
                
                {/* Update default redirect to use the Index page instead of dashboard */}
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
