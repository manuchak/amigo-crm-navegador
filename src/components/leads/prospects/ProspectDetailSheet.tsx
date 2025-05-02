
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Prospect } from '@/services/prospectService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPhoneNumber } from '@/components/shared/call-logs/utils';
import { Separator } from '@/components/ui/separator';
import { X, Phone, Clock, User, Car, Shield } from 'lucide-react';

interface ProspectDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect | null;
  onCall?: (prospect: Prospect) => void;
  onViewCalls?: (prospect: Prospect) => void;
}

const ProspectDetailSheet: React.FC<ProspectDetailSheetProps> = ({
  isOpen,
  onClose,
  prospect,
  onCall,
  onViewCalls
}) => {
  if (!prospect) {
    return null;
  }

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

  // Get status color for badge
  const getStatusColor = (status: string | null) => {
    if (!status) return 'bg-slate-100 text-slate-600';
    
    switch (status.toLowerCase()) {
      case 'nuevo': return 'bg-blue-50 text-blue-600';
      case 'contactado': return 'bg-amber-50 text-amber-600';
      case 'contacto llamado': return 'bg-amber-50 text-amber-600';
      case 'calificado': return 'bg-green-50 text-green-600';
      case 'rechazado': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Check if prospect has call history
  const hasCallHistory = prospect.call_count !== null && prospect.call_count > 0;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl flex justify-between items-center">
            <span className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              {prospect.lead_name || prospect.custodio_name || "Prospecto Sin Nombre"}
            </span>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </SheetTitle>
          <SheetDescription>
            ID: {prospect.lead_id}
            {prospect.lead_status && (
              <Badge className={`ml-2 ${getStatusColor(prospect.lead_status)}`}>
                {prospect.lead_status}
              </Badge>
            )}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          {/* Contact Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-500">Información de Contacto</h3>
            <div className="bg-slate-50 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Teléfono
                </span>
                <span className="font-medium">
                  {formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || "No disponible")}
                </span>
              </div>
              
              {prospect.lead_email && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Email</span>
                  <span>{prospect.lead_email}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Fuente</span>
                <span>{prospect.lead_source || "No definida"}</span>
              </div>
            </div>
          </div>
          
          {/* Call History */}
          {hasCallHistory && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">Historial de Llamadas</h3>
              <div className="bg-slate-50 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold flex items-center">
                    <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                    Total llamadas
                  </span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    {prospect.call_count}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Última llamada</span>
                  <span>{formatDate(prospect.last_call_date)}</span>
                </div>
                
                <div className="mt-3">
                  <Button 
                    size="sm" 
                    className="w-full"
                    variant="outline"
                    onClick={() => onViewCalls && prospect && onViewCalls(prospect)}
                  >
                    Ver historial completo
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Vehicle Info */}
          {(prospect.car_brand || prospect.car_model || prospect.car_year) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">Información del Vehículo</h3>
              <div className="bg-slate-50 rounded-md p-3">
                <div className="flex items-center mb-1">
                  <Car className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  <span className="text-sm font-semibold">Vehículo</span>
                </div>
                <p>{prospect.car_brand} {prospect.car_model} {prospect.car_year}</p>
              </div>
            </div>
          )}
          
          {/* Security Info */}
          {(prospect.security_exp || prospect.sedena_id) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">Información de Seguridad</h3>
              <div className="bg-slate-50 rounded-md p-3">
                {prospect.security_exp && (
                  <>
                    <div className="flex items-center mb-1">
                      <Shield className="h-3.5 w-3.5 mr-1 text-slate-400" />
                      <span className="text-sm font-semibold">Experiencia</span>
                    </div>
                    <p className="mb-3">{prospect.security_exp}</p>
                  </>
                )}
                
                {prospect.sedena_id && (
                  <>
                    <div className="flex items-center mb-1">
                      <span className="text-sm font-semibold">SEDENA ID</span>
                    </div>
                    <p>{prospect.sedena_id}</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {onCall && (
              <Button 
                variant="outline"
                onClick={() => onCall && prospect && onCall(prospect)}
                className="w-full"
              >
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </Button>
            )}
            
            {onViewCalls && (
              <Button 
                variant="default"
                onClick={() => onViewCalls && prospect && onViewCalls(prospect)}
                className="w-full"
              >
                <Clock className="h-4 w-4 mr-2" />
                Ver llamadas
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProspectDetailSheet;
