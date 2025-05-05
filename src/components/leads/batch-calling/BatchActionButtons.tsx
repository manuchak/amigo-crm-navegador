
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { BatchActionButtonsProps } from "./types";

const BatchActionButtons: React.FC<BatchActionButtonsProps> = ({ 
  handleBatchCall, 
  isLoading 
}) => {
  return (
    <>
      <Button
        onClick={() => handleBatchCall("progressive")}
        disabled={isLoading !== null}
        className="w-full"
        type="button"
      >
        {isLoading === "progressive" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
        Llamada Progresiva
      </Button>
      <Button
        onClick={() => handleBatchCall("predictive")}
        disabled={isLoading !== null}
        className="w-full"
        type="button"
        variant="outline"
      >
        {isLoading === "predictive" ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
        Llamada Predictiva
      </Button>
    </>
  );
};

export default BatchActionButtons;
