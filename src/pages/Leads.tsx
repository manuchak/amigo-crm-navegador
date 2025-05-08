
import React, { useState, useEffect, Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import LeadsDashboard from '@/components/leads/LeadsDashboard';
import { LeadsProvider } from '@/context/LeadsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';
import ProspectsPage from '@/components/leads/ProspectsPage';
import QualifiedLeadsApproval from '@/components/leads/QualifiedLeadsApproval';
import LeadsCrmDashboard from '@/components/leads/LeadsCrmDashboard';
import { useAuth } from '@/context/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Leads: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    console.log("Leads page mounted", { 
      user: currentUser?.email,
      authState: !!currentUser ? "authenticated" : "unauthenticated",
      timestamp: new Date().toISOString()
    });
  }, [currentUser]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'prospects') {
      navigate('/leads/prospects');
    } else if (value === 'validation') {
      navigate('/leads/validation');
    } else if (value === 'crm') {
      navigate('/leads/crm');
    } else {
      navigate('/leads');
    }
  };
  
  // Set active tab based on current URL
  React.useEffect(() => {
    try {
      if (location.pathname.includes('/leads/prospects')) {
        setActiveTab('prospects');
      } else if (location.pathname.includes('/leads/validation')) {
        setActiveTab('validation');
      } else if (location.pathname.includes('/leads/crm')) {
        setActiveTab('crm');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error("Error setting active tab:", err);
      setError("Error navigating between tabs");
    }
  }, [location.pathname]);

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <PageLayout title="Leads">
        <div className="w-full flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Cargando autenticación...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error if something went wrong
  if (error) {
    return (
      <PageLayout title="Leads">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Leads">
      <ErrorBoundary>
        <LeadsProvider>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard" className="text-sm">Dashboard de Leads</TabsTrigger>
              <TabsTrigger value="prospects" className="text-sm">Prospectos</TabsTrigger>
              <TabsTrigger value="validation" className="text-sm">Validación</TabsTrigger>
              <TabsTrigger value="crm" className="text-sm">CRM</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Suspense fallback={<LoadingContent />}>
                  <LeadsDashboard />
                </Suspense>
              </div>
            </TabsContent>
            
            <TabsContent value="prospects" className="mt-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Suspense fallback={<LoadingContent />}>
                  <ProspectsPage />
                </Suspense>
              </div>
            </TabsContent>
            
            <TabsContent value="validation" className="mt-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Suspense fallback={<LoadingContent />}>
                  <QualifiedLeadsApproval />
                </Suspense>
              </div>
            </TabsContent>
            
            <TabsContent value="crm" className="mt-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Suspense fallback={<LoadingContent />}>
                  <LeadsCrmDashboard />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
        </LeadsProvider>
      </ErrorBoundary>
    </PageLayout>
  );
};

// Custom ErrorBoundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Leads error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error en el componente</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || "Ocurrió un error al cargar este componente."}
            <div className="mt-2">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Loading placeholder component
const LoadingContent: React.FC = () => (
  <div className="flex flex-col space-y-4 animate-pulse">
    <div className="h-8 bg-slate-100 rounded w-1/4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-24 bg-slate-100 rounded"></div>
      <div className="h-24 bg-slate-100 rounded"></div>
      <div className="h-24 bg-slate-100 rounded"></div>
    </div>
    <div className="h-64 bg-slate-100 rounded"></div>
  </div>
);

// Import Button component for the ErrorBoundary
import { Button } from '@/components/ui/button';

export default Leads;
