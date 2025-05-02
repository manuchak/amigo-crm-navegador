
import React, { useState } from 'react';
import ProspectsList from './prospects/ProspectsList';
import { Prospect } from '@/services/prospectService';
import { useToast } from '@/hooks/use-toast';
import CallLogDialog from './CallLogDialog';

const ProspectsPage: React.FC = () => {
  const { toast } = useToast();
  const [callLogDialogOpen, setCallLogDialogOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Define handlers for button actions
  const handleViewDetails = (prospect: Prospect) => {
    toast({
      title: "Ver detalles",
      description: `Viendo detalles de ${prospect.lead_name || prospect.custodio_name || 'Prospecto ' + prospect.lead_id}`,
    });
    // Add actual implementation for viewing details
  };

  const handleCall = (prospect: Prospect) => {
    toast({
      title: "Llamada",
      description: `Iniciando llamada a ${formatPhoneNumber(prospect.lead_phone || prospect.phone_number_intl || '')}`,
    });
    // Add actual implementation for calling
  };

  const handleViewCalls = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setCallLogDialogOpen(true);
  };

  const handleValidate = (prospect: Prospect) => {
    toast({
      title: "Validar prospecto",
      description: `Validando prospecto ${prospect.lead_name || prospect.custodio_name || 'Prospecto ' + prospect.lead_id}`,
    });
    // Add actual implementation for validation
  };

  // Helper function for phone formatting
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'No disponible';
    
    // Strip non-numeric characters
    const digits = phone.replace(/\D/g, '');
    
    // Format based on length - this handles Mexican numbers well
    if (digits.length === 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else if (digits.length > 10) {
      return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -7)}-${digits.slice(-7, -4)}-${digits.slice(-4)}`;
    }
    
    return phone; // Return original if we can't format
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Prospectos de Custodios</h2>
      <ProspectsList 
        onViewDetails={handleViewDetails}
        onCall={handleCall}
        onViewCalls={handleViewCalls}
        onValidate={handleValidate}
      />

      {selectedProspect && (
        <CallLogDialog
          open={callLogDialogOpen}
          onOpenChange={setCallLogDialogOpen}
          leadName={selectedProspect.lead_name || selectedProspect.custodio_name || `Prospecto ${selectedProspect.lead_id}`}
          leadPhone={selectedProspect.lead_phone || selectedProspect.phone_number_intl}
          leadId={selectedProspect.lead_id}
        />
      )}
    </div>
  );
};

export default ProspectsPage;
