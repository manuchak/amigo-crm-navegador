
import React from 'react';
import { Timer, AlertCircle } from 'lucide-react';
import { ActiveService } from '../../types';

interface RiskIndicatorsProps {
  service: ActiveService;
}

export function RiskIndicators({ service }: RiskIndicatorsProps) {
  if (!service.delayRisk && !service.inRiskZone) {
    return null;
  }
  
  return (
    <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
      {service.delayRisk && (
        <div className="flex items-center gap-2 mb-2">
          <Timer className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium">
            {service.delayRiskPercent}% probabilidad de retraso
          </span>
        </div>
      )}
      {service.inRiskZone && (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">En zona de alto riesgo</span>
        </div>
      )}
    </div>
  );
}
