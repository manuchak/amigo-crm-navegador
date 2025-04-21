
import React from 'react';
import { Prospect } from '@/services/prospectService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckSquare, FileText, PhoneCall, Car, Shield, HardHat, Award } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ProspectDetailViewProps {
  prospect: Prospect;
  onBack: () => void;
  onViewCalls?: () => void;
  onValidate?: () => void;
}

export const ProspectDetailView: React.FC<ProspectDetailViewProps> = ({
  prospect,
  onBack,
  onViewCalls,
  onValidate
}) => {
  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'nuevo': return 'bg-blue-50 text-blue-600';
      case 'contactado': return 'bg-amber-50 text-amber-600';
      case 'calificado': return 'bg-green-50 text-green-600';
      case 'rechazado': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Check if prospect has call history
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
  
  // Check if prospect has interview data
  const hasInterviewData = prospect.transcript !== null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {prospect.lead_name || prospect.custodio_name || "Prospecto Sin Nombre"}
            {prospect.lead_status && (
              <Badge className={`ml-2 ${getStatusColor(prospect.lead_status)}`}>
                {prospect.lead_status}
              </Badge>
            )}
          </h2>
          <p className="text-slate-500">
            ID: {prospect.lead_id}{prospect.validated_lead_id ? ` / Validado: ${prospect.validated_lead_id}` : ''}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {onViewCalls && hasCallHistory && (
            <Button 
              variant="outline" 
              onClick={onViewCalls}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
            >
              <Clock className="h-4 w-4 mr-2" /> Ver historial de llamadas
            </Button>
          )}
          
          {onValidate && hasInterviewData && (
            <Button 
              variant="outline" 
              onClick={onValidate}
              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            >
              <CheckSquare className="h-4 w-4 mr-2" /> Validar prospecto
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información de contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Teléfono</p>
              <p>{formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}</p>
            </div>
            
            {prospect.lead_email && (
              <div>
                <p className="text-sm font-medium text-slate-500">Email</p>
                <p>{prospect.lead_email}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm font-medium text-slate-500">Estado del prospecto</p>
              <p>{prospect.lead_status || "No definido"}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500">Fuente</p>
              <p>{prospect.lead_source || "No definida"}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500">Fecha de creación</p>
              <p>{formatDate(prospect.lead_created_at)}</p>
            </div>
            
            {hasCallHistory && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-slate-500">Total de llamadas</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                      {prospect.call_count}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-slate-500">Última llamada</p>
                    <p>{formatDate(prospect.last_call_date)}</p>
                  </div>
                  
                  {hasInterviewData && (
                    <div className="mt-2">
                      <Badge className="bg-green-50 text-green-600 border-green-200">
                        <FileText className="h-4 w-4 mr-1" /> Entrevista completada
                      </Badge>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Detalles del custodio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Custodio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prospect.car_brand && (
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center">
                  <Car className="h-4 w-4 mr-1 text-slate-400" /> Vehículo
                </p>
                <p>{prospect.car_brand} {prospect.car_model} {prospect.car_year}</p>
              </div>
            )}
            
            {prospect.security_exp && (
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-slate-400" /> Experiencia en seguridad
                </p>
                <p>{prospect.security_exp}</p>
              </div>
            )}
            
            {prospect.sedena_id && (
              <div>
                <p className="text-sm font-medium text-slate-500 flex items-center">
                  <Award className="h-4 w-4 mr-1 text-slate-400" /> Identificación SEDENA
                </p>
                <p>{prospect.sedena_id}</p>
              </div>
            )}
            
            {/* Si no hay datos de custodio validados */}
            {!prospect.car_brand && !prospect.security_exp && !prospect.sedena_id && (
              <div className="text-center py-6 text-slate-500">
                <HardHat className="h-12 w-12 mx-auto text-slate-300" />
                <p className="mt-2">No hay información detallada del custodio</p>
                <p className="text-sm">Es necesario realizar una entrevista para obtener más datos</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => {
                    // Handle calling the prospect
                  }}
                >
                  <PhoneCall className="h-4 w-4 mr-2" /> Programar entrevista
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
