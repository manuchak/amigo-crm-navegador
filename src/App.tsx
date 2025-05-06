
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import './App.css';

// Import all components directly to avoid dynamic import issues
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import Support from './pages/Support';
import ResetPassword from './pages/ResetPassword';
import VerifyConfirmation from './pages/VerifyConfirmation';

// Componente para redireccionar si no está autenticado
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Verificar autenticación directamente con Supabase
  const [isAuthed, setIsAuthed] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await fetch('https://beefjsdgrdeiymzxwxru.supabase.co/auth/v1/user', {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZWZqc2RncmRlaXltenh3eHJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MzI1OTQsImV4cCI6MjA1ODUwODU5NH0.knvlRdFYtN2bl3t3I4O8v3dU_MWKDDuaBZkvukdU87w',
            'Authorization': `Bearer ${localStorage.getItem('sb-beefjsdgrdeiymzxwxru-auth-token')}`,
          }
        }).then(res => res.json());
        
        setIsAuthed(!!data);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthed(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  if (isLoading) return <div>Cargando...</div>;
  
  if (!isAuthed) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  console.log('App rendering');
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-confirmation" element={<VerifyConfirmation />} />
          
          {/* App Routes - Add your other routes here */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/user-management" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/support" element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          } />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
