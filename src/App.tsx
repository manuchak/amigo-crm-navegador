
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/auth/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';

// Create a client
const queryClient = new QueryClient();

// Import all components directly to avoid dynamic import issues
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import ActiveServices from './pages/ActiveServices';
import LeadJourney from './pages/LeadJourney';
import Leads from './pages/Leads';
import Requerimientos from './pages/Requerimientos';
import InstalacionGPS from './pages/InstalacionGPS';
import UserManagement from './pages/UserManagement';
import Support from './pages/Support';
import ResetPassword from './pages/ResetPassword';
import VerifyConfirmation from './pages/VerifyConfirmation';
import Index from './pages/Index';
import Prospects from './pages/Prospects';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('ProtectedRoute check:', { 
      authenticated: !!currentUser, 
      loading, 
      path: location.pathname 
    });
    
    if (!loading && !currentUser) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [currentUser, loading, navigate, location]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin mx-auto text-primary mb-4 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  
  return currentUser ? <>{children}</> : null;
};

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log('App Routes rendering with:', { 
      authenticated: !!currentUser, 
      loading, 
      pathname: location.pathname 
    });
  }, [currentUser, loading, location.pathname]);
  
  return (
    <Routes>
      {/* Auth Routes - Public */}
      <Route path="/login" element={
        currentUser && !loading ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/auth" element={
        currentUser && !loading ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-confirmation" element={<VerifyConfirmation />} />
      
      {/* Protected Routes */}
      <Route 
        path="/" 
        element={<ProtectedRoute><Index /></ProtectedRoute>} 
      />
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/performance" 
        element={<ProtectedRoute><Performance /></ProtectedRoute>} 
      />
      <Route 
        path="/active-services" 
        element={<ProtectedRoute><ActiveServices /></ProtectedRoute>} 
      />
      
      {/* Lead Journey Routes */}
      <Route 
        path="/lead-journey" 
        element={<ProtectedRoute><LeadJourney /></ProtectedRoute>} 
      />
      <Route 
        path="/lead-journey/:tab" 
        element={<ProtectedRoute><LeadJourney /></ProtectedRoute>} 
      />
      
      {/* Legacy Lead Routes - redirect to new journey */}
      <Route 
        path="/leads" 
        element={<Navigate to="/lead-journey" replace />} 
      />
      <Route 
        path="/leads/prospects" 
        element={<Navigate to="/lead-journey/interviews" replace />} 
      />
      <Route 
        path="/leads/validation" 
        element={<Navigate to="/lead-journey/validation" replace />} 
      />
      <Route 
        path="/leads/crm" 
        element={<Navigate to="/lead-journey/summary" replace />} 
      />
      
      <Route 
        path="/requerimientos" 
        element={<ProtectedRoute><Requerimientos /></ProtectedRoute>} 
      />
      <Route 
        path="/instalacion-gps" 
        element={<ProtectedRoute><InstalacionGPS /></ProtectedRoute>} 
      />
      <Route 
        path="/user-management" 
        element={<ProtectedRoute><UserManagement /></ProtectedRoute>} 
      />
      <Route 
        path="/support" 
        element={<ProtectedRoute><Support /></ProtectedRoute>} 
      />
    </Routes>
  );
};

function App() {
  console.log('App rendering');
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
