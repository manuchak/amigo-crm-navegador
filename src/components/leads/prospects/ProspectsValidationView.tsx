
import React from 'react';
import { Prospect } from '@/services/prospectService';
import { ValidationContent } from './components/ValidationContent';
import { ConfirmDialog } from './dialogs/ConfirmDialog';
import { SuccessDialog } from './dialogs/SuccessDialog';
import { useValidationFlow } from './hooks/useValidationFlow';

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
      <ValidationContent
        prospect={prospect}
        formData={formData}
        loading={loading}
        error={error}
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
