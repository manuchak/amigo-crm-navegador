
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
    <div className="mt-3 bg-white p-2.5 rounded-lg shadow-sm border border-red-100">
      <h4 className="font-semibold text-sm text-red-600 mb-2">Indicadores de Riesgo</h4>
      
      {service.delayRisk && (
        <div className="flex items-center gap-2 mb-2 bg-amber-50 p-2 rounded-md">
          <Timer className="h-4 w-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              Riesgo de retraso detectado
            </span>
            <span className="text-xs text-slate-600">
              {service.delayRiskPercent}% probabilidad de retraso en la entrega
            </span>
          </div>
        </div>
      )}
      
      {service.inRiskZone && (
        <div className="flex items-center gap-2 bg-red-50 p-2 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              En zona de alto riesgo
            </span>
            <span className="text-xs text-slate-600">
              La ubicación actual está en una zona marcada como insegura
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
