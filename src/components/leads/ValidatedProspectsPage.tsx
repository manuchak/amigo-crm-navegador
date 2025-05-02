
import React, { useState } from 'react';
import ValidatedProspectsList from './prospects/ValidatedProspectsList';
import { Prospect } from '@/services/prospectService';
import { useToast } from '@/hooks/use-toast';
import CallLogDialog from './CallLogDialog';
import ProspectDetailSheet from './prospects/ProspectDetailSheet';

const ValidatedProspectsPage: React.FC = () => {
  const { toast } = useToast();
  const [callLogDialogOpen, setCallLogDialogOpen] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Define handlers for button actions
  const handleViewDetails = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setDetailSheetOpen(true);
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
      <h2 className="text-xl font-semibold">Custodios Validados</h2>
      <ValidatedProspectsList 
        onViewDetails={handleViewDetails}
        onCall={handleCall}
        onViewCalls={handleViewCalls}
      />

      {/* Call Log Dialog */}
      {selectedProspect && (
        <CallLogDialog
          open={callLogDialogOpen}
          onOpenChange={setCallLogDialogOpen}
          leadName={selectedProspect.lead_name || selectedProspect.custodio_name || `Prospecto ${selectedProspect.lead_id}`}
          leadPhone={selectedProspect.lead_phone || selectedProspect.phone_number_intl}
          leadId={selectedProspect.lead_id || 0}
        />
      )}

      {/* Prospect Detail Sheet */}
      <ProspectDetailSheet
        isOpen={detailSheetOpen}
        onClose={() => setDetailSheetOpen(false)}
        prospect={selectedProspect}
        onCall={handleCall}
        onViewCalls={handleViewCalls}
      />
    </div>
  );
};

export default ValidatedProspectsPage;
