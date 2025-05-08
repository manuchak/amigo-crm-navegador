
import React from 'react';
import { Prospect } from '@/services/prospectService';
import { ValidationContent } from './components/ValidationContent';
import { ConfirmDialog } from './dialogs/ConfirmDialog';
import { SuccessDialog } from './dialogs/SuccessDialog';
import { useValidationFlow } from './hooks/useValidationFlow';
import { useAuth } from '@/context/auth'; // Updated import path
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Info } from 'lucide-react';

interface ProspectsValidationViewProps {
  prospect: Prospect;
  onBack: () => void;
  onComplete: () => void;
}

const ProspectsValidationView: React.FC<ProspectsValidationViewProps> = ({
  prospect,
  onBack,
  onComplete
}) => {
  const { userData } = useAuth();
  const isOwner = userData?.role === 'owner';
  
  const {
    formData,
    confirmDialog,
    successDialog,
    loading,
    error,
    isFormComplete,
    isCriticalCriteriaMet,
    handleInputChange,
    handleSaveValidation,
    handleApprove,
    handleReject,
    setConfirmDialog,
    setSuccessDialog,
    confirmStatusChange,
    handleComplete
  } = useValidationFlow(prospect, onComplete);

  return (
    <div className="space-y-6">
      {isOwner && (
        <Alert variant="info" className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Modo propietario activo - acceso total a validaciones concedido
          </AlertDescription>
        </Alert>
      )}
      
      {error && isOwner && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-700">
            Se detectó un error pero se está intentando continuar con privilegios de propietario
          </AlertDescription>
        </Alert>
      )}
      
      <ValidationContent
        prospect={prospect}
        formData={formData}
        loading={loading}
        error={isOwner ? null : error} // Hide errors for owners unless critical
        handleInputChange={handleInputChange}
        handleSaveValidation={handleSaveValidation}
        handleApprove={handleApprove}
        handleReject={handleReject}
        onBack={onBack}
        isFormComplete={isFormComplete}
        isCriticalCriteriaMet={isCriticalCriteriaMet}
      />
      
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        status={confirmDialog.status}
        onConfirm={confirmStatusChange}
        loading={loading}
      />
      
      <SuccessDialog
        open={successDialog.open}
        onOpenChange={(open) => setSuccessDialog({ ...successDialog, open })}
        status={successDialog.status}
        lifetimeId={successDialog.lifetime_id}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default ProspectsValidationView;
