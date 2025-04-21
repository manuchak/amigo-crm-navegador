
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ProspectsList from './prospects/ProspectsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProspectDetailView } from './prospects/ProspectDetailView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardCheck, PhoneCall, RefreshCw } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { useProspects } from '@/hooks/useProspects';
import ProspectsCallHistory from './prospects/ProspectsCallHistory';
import ProspectsValidationView from './prospects/ProspectsValidationView';

const ProspectsPage: React.FC = () => {
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [activeView, setActiveView] = useState<'list' | 'detail' | 'calls' | 'validation'>('list');
  const { refetch, loading } = useProspects();
  
  const handleViewDetail = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setActiveView('detail');
  };
  
  const handleViewCalls = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setActiveView('calls');
  };
  
  const handleValidate = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setActiveView('validation');
  };
  
  const handleBackToList = () => {
    setActiveView('list');
    setSelectedProspect(null);
  };
  
  const handleRefresh = () => {
    refetch();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'detail':
        return selectedProspect ? (
          <ProspectDetailView 
            prospect={selectedProspect} 
            onBack={handleBackToList}
            onViewCalls={() => handleViewCalls(selectedProspect)}
            onValidate={() => handleValidate(selectedProspect)}
          />
        ) : (
          // Return null instead of void
          null 
        );
      case 'calls':
        return selectedProspect ? (
          <ProspectsCallHistory 
            prospect={selectedProspect} 
            onBack={handleBackToList}
          />
        ) : (
          // Return null instead of void
          null
        );
      case 'validation':
        return selectedProspect ? (
          <ProspectsValidationView
            prospect={selectedProspect}
            onBack={handleBackToList}
            onComplete={() => {
              handleBackToList();
              refetch();
            }}
          />
        ) : (
          // Return null instead of void
          null
        );
      default:
        return (
          <ProspectsList 
            onViewDetails={handleViewDetail} 
            onViewCalls={handleViewCalls}
            onValidate={handleValidate}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">
              {activeView === 'list' ? 'Prospectos Unificados' : 
               activeView === 'detail' ? `Detalle de Prospecto: ${selectedProspect?.lead_name || 'Sin nombre'}` : 
               activeView === 'calls' ? `Historial de Llamadas: ${selectedProspect?.lead_name || 'Sin nombre'}` : 
               `Validación de Prospecto: ${selectedProspect?.lead_name || 'Sin nombre'}`}
            </CardTitle>
            <CardDescription>
              {activeView === 'list' ? 'Vista consolidada de prospectos con datos de validación y llamadas' : 
               activeView === 'detail' ? 'Información detallada del prospecto' : 
               activeView === 'calls' ? 'Historial completo de intentos de contacto' : 
               'Validación de requisitos del prospecto'}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            {activeView !== 'list' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToList}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProspectsPage;
