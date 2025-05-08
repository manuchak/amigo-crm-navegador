
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/auth';

// Import ALL auth-related and critical components statically 
import Login from './pages/Login';
import Auth from './pages/Auth';
import VerifyConfirmation from './pages/VerifyConfirmation';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads'; // Keep as static import
import Prospects from './pages/Prospects';
import Performance from './pages/Performance';

// Use dynamic imports for non-critical components
const LeadJourney = React.lazy(() => import('./pages/LeadJourney'));
const Settings = React.lazy(() => import('./pages/Settings'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Use a proper loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="h-8 w-8 animate-spin mx-auto mb-4 border-4 border-t-primary border-gray-200 rounded-full"></div>
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  </div>
);

function AuthLogger() {
  const start = performance.now();
  
  useEffect(() => {
    const end = performance.now();
    console.log(`[Auth] Initialization took ${(end - start).toFixed(2)}ms`);
    
    // Log authentication-related localStorage items (without values)
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || 
      key.includes('supabase') || 
      key.includes('user') ||
      key.includes('session')
    );
    
    console.log('[Auth] Storage keys:', authKeys);
    
    // Log any session or user info in window object
    if ('Supabase' in window) {
      console.log('[Auth] Supabase initialized in window object');
    }
  }, []);
  
  return null;
}

function App() {
  // Log initial render for debugging
  useEffect(() => {
    console.log("App rendering");
    
    // Add a global error handler for auth-related errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
      // Check if the error is auth-related
      const errorString = args.join(' ');
      if (
        errorString.includes('auth') || 
        errorString.includes('session') || 
        errorString.includes('token') ||
        errorString.includes('user')
      ) {
        console.log('[Auth Error]', ...args);
      }
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <AuthProvider>
      <AuthLogger />
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Authentication routes - NO Suspense wrapper for auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-confirmation" element={<VerifyConfirmation />} />
          
          {/* Dashboard route - Imported statically to avoid loading issues */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Leads, Prospects, and Performance routes - Imported statically */}
          <Route path="/leads" element={<Leads />} />
          <Route path="/leads/*" element={<Leads />} /> {/* Handle nested routes */}
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/performance" element={<Performance />} />
          
          {/* Other protected routes with Suspense */}
          <Route path="/lead-journey/*" element={
            <Suspense fallback={<LoadingFallback />}>
              <LeadJourney />
            </Suspense>
          } />
          <Route path="/settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <Settings />
            </Suspense>
          } />
          <Route path="/user-management" element={
            <Suspense fallback={<LoadingFallback />}>
              <UserManagement />
            </Suspense>
          } />
          <Route path="*" element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFound />
            </Suspense>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
