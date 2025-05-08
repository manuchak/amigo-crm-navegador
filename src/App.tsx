
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';

// Import components without using dynamic imports for critical paths
import Login from './pages/Login';
import Auth from './pages/Auth';

// Use dynamic imports for non-critical components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const LeadJourney = React.lazy(() => import('./pages/LeadJourney'));
const Settings = React.lazy(() => import('./pages/Settings'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const VerifyConfirmation = React.lazy(() => import('./pages/VerifyConfirmation'));

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
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lead-journey" element={<LeadJourney />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/verify-confirmation" element={<VerifyConfirmation />} />
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
