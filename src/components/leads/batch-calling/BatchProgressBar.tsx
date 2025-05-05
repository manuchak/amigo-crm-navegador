
import React from "react";
import { Progress } from "@/components/ui/progress";
import { BatchProgressBarProps } from "./types";

const BatchProgressBar: React.FC<BatchProgressBarProps> = ({ isLoading, progress }) => {
  if (!isLoading) return null;
  
  return (
    <div className="mb-2">
      <Progress value={progress} />
      <div className="text-xs text-slate-500 mt-1 text-right">{progress}% completado</div>
    </div>
  );
};

export default BatchProgressBar;
