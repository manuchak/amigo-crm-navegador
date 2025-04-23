
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentErrorProps {
  error?: string | null;
  onBack: () => void;
  noInstallData?: boolean;
}

export const AppointmentError: React.FC<AppointmentErrorProps> = ({
  error,
  onBack,
  noInstallData
}) => {
  if (!error && !noInstallData) return null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {noInstallData 
            ? "No se encontraron datos de instalación. Por favor regrese e ingrese la información necesaria."
            : error}
        </AlertDescription>
      </Alert>
      <div className="flex justify-center">
        <Button onClick={onBack}>Regresar</Button>
      </div>
    </div>
  );
};
