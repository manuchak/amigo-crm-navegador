
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ClipboardList, Users, Phone } from 'lucide-react';

const LeadsCrmDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">CRM de Leads</h2>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Refrescar'}
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Gestión de relaciones con leads calificados y seguimiento de conversiones.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Leads Calificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ClipboardList className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">0</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Conversiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-4 w-4 text-green-500 mr-2" />
              <div className="text-2xl font-bold">0</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Llamadas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Phone className="h-4 w-4 text-blue-500 mr-2" />
              <div className="text-2xl font-bold">0</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Alert>
        <AlertDescription>
          El módulo CRM está en desarrollo. Pronto tendrás acceso a todas las funcionalidades.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LeadsCrmDashboard;
