
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext'; // Using our local AuthContext
import { LeadsProvider } from '@/context/LeadsContext'; // Import LeadsProvider
import AuthGuard from '@/components/auth/AuthGuard';
import Navbar from '@/components/Navbar';
import './App.css';

// Create a React Query client
const queryClient = new QueryClient();

// Lazy load routes for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Login = React.lazy(() => import('./pages/Login')); // Add this if needed
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const Leads = React.lazy(() => import('./pages/Leads'));
const Prospects = React.lazy(() => import('./pages/Prospects'));
const Validation = React.lazy(() => import('./pages/Validation'));
const Support = React.lazy(() => import('./pages/Support'));
const CallCenter = React.lazy(() => import('./pages/CallCenter'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LeadsProvider> {/* Wrap with LeadsProvider */}
          <Router>
            <Navbar />
            <Suspense fallback={<div className="loading">Cargando...</div>}>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Login />} />
                
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
                
                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </Router>
          <Toaster position="top-right" richColors closeButton />
        </LeadsProvider> {/* Close LeadsProvider */}
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
