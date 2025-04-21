
import React from 'react';
import { Prospect } from '@/services/prospectService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, Clock, FileText, PhoneCall } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/utils';

interface ProspectsTableProps {
  prospects: Prospect[];
  onViewDetails?: (prospect: Prospect) => void;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
  onValidate?: (prospect: Prospect) => void;
}

const ProspectsTable: React.FC<ProspectsTableProps> = ({
  prospects,
  onViewDetails,
  onCall,
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

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Vehículo</TableHead>
            <TableHead>Experiencia</TableHead>
            <TableHead>Llamadas</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prospects.map((prospect) => {
            const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;
            const hasInterviewData = prospect.transcript !== null;

            return (
              <TableRow key={`prospect-${prospect.lead_id}-${prospect.validated_lead_id}`}>
                <TableCell>
                  <div className="font-medium">{prospect.lead_name || prospect.custodio_name || "Sin nombre"}</div>
                  <div className="text-sm text-slate-500">
                    Creado: {formatDate(prospect.lead_created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
                  {prospect.lead_email && (
                    <div className="text-xs text-slate-500">{prospect.lead_email}</div>
                  )}
                </TableCell>
                <TableCell>
                  {prospect.lead_status && (
                    <Badge className={`${getStatusColor(prospect.lead_status)}`}>
                      {prospect.lead_status}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {prospect.car_brand ? (
                    <span>
                      {prospect.car_brand} {prospect.car_model} {prospect.car_year}
                    </span>
                  ) : (
                    <span className="text-slate-400">No registrado</span>
                  )}
                </TableCell>
                <TableCell>
                  {prospect.security_exp || (
                    <span className="text-slate-400">No registrada</span>
                  )}
                </TableCell>
                <TableCell>
                  {prospect.call_count ? (
                    <div>
                      <Badge variant="outline">{prospect.call_count}</Badge>
                      {prospect.last_call_date && (
                        <div className="text-xs text-slate-500 mt-1">
                          Última: {formatDate(prospect.last_call_date)}
                        </div>
                      )}
                      
                      {hasInterviewData && (
                        <Badge variant="outline" className="mt-1 bg-green-50 text-green-600 border-green-200">
                          <FileText className="h-3 w-3 mr-1" /> Entrevista
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">Sin llamadas</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {onCall && (
                      <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={() => onCall(prospect)}>
                        <PhoneCall className="h-4 w-4 mr-1" /> Llamar
                      </Button>
                    )}
                    
                    {onViewDetails && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="whitespace-nowrap" 
                        onClick={() => onViewDetails(prospect)}
                      >
                        Ver detalles
                      </Button>
                    )}
                    
                    {onViewCalls && hasCallHistory && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewCalls(prospect)}
                        className="whitespace-nowrap bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                      >
                        <Clock className="h-4 w-4 mr-1" /> Historial
                      </Button>
                    )}
                    
                    {onValidate && hasInterviewData && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onValidate(prospect)}
                        className="whitespace-nowrap bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                      >
                        <CheckSquare className="h-4 w-4 mr-1" /> Validar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProspectsTable;
