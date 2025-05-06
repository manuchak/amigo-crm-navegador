import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from '@/context/auth/AuthContext';
import './App.css';

// Import all components directly to avoid dynamic import issues
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import ActiveServices from './pages/ActiveServices';
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
    // Add debug logging
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
  
  // Log for debugging
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
      <Route 
        path="/leads" 
        element={<ProtectedRoute><Leads /></ProtectedRoute>} 
      />
      <Route 
        path="/leads/prospects" 
        element={<ProtectedRoute><Leads /></ProtectedRoute>} 
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
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
