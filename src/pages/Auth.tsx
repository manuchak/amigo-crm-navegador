
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/SupabaseAuthContext';
import { Loader2, Shield } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Get return URL from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
  
  // Redirect if already logged in
  useEffect(() => {
    if (session && !loading) {
      console.log('User already logged in, redirecting to:', from);
      navigate(from, { replace: true });
    }
  }, [session, loading, navigate, from]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={24} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Bienvenido</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión o crea una nueva cuenta para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { user, error } = await signIn(email, password);
      
      if (error) throw error;
      if (user) {
        console.log('Login successful, redirecting to:', from);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
            Iniciando sesión...
          </span>
        ) : 'Iniciar Sesión'}
      </button>
    </form>
  );
};

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { user, error } = await signUp(email, password, { 
        data: { 
          display_name: displayName 
        } 
      });
      
      if (error) throw error;
      
      if (user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium">
          Correo electrónico
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md"
          minLength={6}
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
            Creando cuenta...
          </span>
        ) : 'Crear Cuenta'}
      </button>
    </form>
  );
};

export default Auth;
