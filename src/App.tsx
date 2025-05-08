import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';

// Import ALL auth-related components statically to avoid dynamic import issues
import Login from './pages/Login';
import Auth from './pages/Auth';
import VerifyConfirmation from './pages/VerifyConfirmation';
import Dashboard from './pages/Dashboard';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton />
        <Routes>
          {/* Authentication routes - NO Suspense wrapper for auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-confirmation" element={<VerifyConfirmation />} />
          
          {/* Dashboard route - Also import statically to avoid loading issues */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Other protected routes with Suspense */}
          <Route path="/lead-journey" element={
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
