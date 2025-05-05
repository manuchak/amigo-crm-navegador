
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-base font-medium text-slate-800">Indicadores de Riesgo</h3>
      </div>
      
      {service.delayRisk && (
        <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-md">
          <Timer className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              Riesgo de retraso detectado
            </p>
            <p className="text-xs text-amber-600">
              {service.delayRiskPercent}% probabilidad de retraso
            </p>
          </div>
        </div>
      )}
      
      {service.inRiskZone && (
        <div className="flex items-center gap-2 py-2 px-3 bg-red-50 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">
              En zona de alto riesgo
            </p>
            <p className="text-xs text-red-600">
              Ubicación actual en zona marcada como insegura
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
