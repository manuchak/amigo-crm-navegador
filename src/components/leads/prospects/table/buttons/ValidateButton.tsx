
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Prospect } from '@/services/prospectService';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLeads } from '@/context/LeadsContext';
import { toast } from 'sonner';
import ValidateConfirmDialog from '../dialogs/ValidateConfirmDialog';

interface ValidateButtonProps {
  prospect: Prospect;
  onValidate?: (prospect: Prospect) => void;
  hasInterviewData: boolean;
}

const ValidateButton: React.FC<ValidateButtonProps> = ({
  prospect,
  onValidate,
  hasInterviewData,
}) => {
  const { updateLeadStatus } = useLeads();
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);

  const handleValidateClick = async () => {
    try {
      // Update lead status to "Validado" when validate button is clicked
      if (prospect.lead_id) {
        await updateLeadStatus(prospect.lead_id, "Validado");
        toast.success(`Custodio ${prospect.lead_name || prospect.custodio_name || 'Prospecto'} ha sido validado`);
      } else {
        toast.error("No se encontró ID del custodio");
      }
      
      // Call the parent's onValidate handler if provided
      if (onValidate) {
        onValidate(prospect);
      }
    } catch (error) {
      console.error("Error al validar custodio:", error);
      toast.error("Error al validar el custodio");
      
      // Still call the original onValidate handler in case there's fallback logic
      if (onValidate) {
        onValidate(prospect);
      }
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant={hasInterviewData ? "ghost" : "outline"}
            size="icon"
            className={`h-8 w-8 rounded-full ${hasInterviewData ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            onClick={() => setValidateDialogOpen(true)}
          >
            <Check className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Validar</p>
        </TooltipContent>
      </Tooltip>
      
      <ValidateConfirmDialog
        open={validateDialogOpen}
        onOpenChange={setValidateDialogOpen}
        prospect={prospect}
        onConfirm={handleValidateClick}
      />
    </>
  );
};

export default ValidateButton;
