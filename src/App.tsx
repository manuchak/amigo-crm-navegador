import React, { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/auth';
import { toast } from 'sonner';

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
  const { currentUser, loading } = useAuth();
  const [loggedOut, setLoggedOut] = useState(false);
  
  useEffect(() => {
    const end = performance.now();
    console.log(`[Auth] Initialization took ${(end - start).toFixed(2)}ms`);
    console.log(`[Auth] Auth loading state: ${loading}`);
    console.log(`[Auth] User authenticated: ${!!currentUser}`);
    
    // Log authentication-related localStorage items (without values)
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || 
      key.includes('supabase') || 
      key.includes('user') ||
      key.includes('session')
    );
    
    console.log('[Auth] Storage keys:', authKeys);
    
    // Check if previously logged in but now logged out
    const hadPreviousSession = authKeys.length > 0;
    if (hadPreviousSession && !currentUser && !loading && !loggedOut) {
      setLoggedOut(true);
      toast.error("Sesión expirada", {
        description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
      });
    }
    
    // Log any session or user info in window object
    if ('Supabase' in window) {
      console.log('[Auth] Supabase initialized in window object');
    }
  }, [currentUser, loading]);
  
  return null;
}

// Protected route component that handles auth state
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  const [appReady, setAppReady] = useState(false);

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
    
    // Set app as ready after a short delay to ensure auth is initialized
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 500);
    
    return () => {
      console.error = originalConsoleError;
      clearTimeout(timer);
    };
  }, []);

  if (!appReady) {
    return <LoadingFallback />;
  }

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
          
          {/* Protected routes - Use the ProtectedRoute component */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          
          {/* Core functionality routes - Imported statically but protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } />
          <Route path="/leads/*" element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } />
          <Route path="/prospects" element={
            <ProtectedRoute>
              <Prospects />
            </ProtectedRoute>
          } />
          <Route path="/performance" element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          } />
          
          {/* Other protected routes with Suspense */}
          <Route path="/lead-journey/*" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <LeadJourney />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <Settings />
              </Suspense>
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <UserManagement />
              </Suspense>
            </ProtectedRoute>
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
