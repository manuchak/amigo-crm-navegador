
import React from 'react';
import { Timer, AlertCircle, CloudRain, ArrowDown } from 'lucide-react';
import { ActiveService } from '../../types';

interface RiskIndicatorsProps {
  service: ActiveService;
}

export function RiskIndicators({ service }: RiskIndicatorsProps) {
  const hasRisks = service.delayRisk || 
                  service.inRiskZone || 
                  (service.weatherEvent && service.weatherEvent.severity > 0) ||
                  (service.roadBlockage && service.roadBlockage.active);
  
  if (!hasRisks) {
    return null;
  }
  
  // Determine if service is on time
  const isOnTime = service.isOnTime !== undefined 
    ? service.isOnTime 
    : (service.status !== 'delayed' && !(service.delayRisk && service.delayRiskPercent > 50));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <h3 className="text-base font-medium text-slate-800">Indicadores de Riesgo</h3>
      </div>
      
      {service.roadBlockage && service.roadBlockage.active && (
        <div className="flex items-center gap-2 py-2 px-3 bg-red-50 rounded-md">
          <ArrowDown className="h-4 w-4 text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700">
              Bloqueo vial en ruta
              {service.roadBlockage.causesDelay 
                ? " (causa retraso)" 
                : isOnTime ? " (sin afectar tiempo de entrega)" : ""}
            </p>
            <p className="text-xs text-red-600">
              {service.roadBlockage.location || 'En ruta programada'} - {service.roadBlockage.reason || 'Bloqueo reportado'}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Retraso estimado: {service.roadBlockage.estimatedDelay || '45-60 minutos'}
            </p>
          </div>
        </div>
      )}
      
      {service.weatherEvent && service.weatherEvent.severity > 0 && (
        <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-md">
          <CloudRain className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              Alerta climática en ruta
              {service.weatherEvent.causesDelay 
                ? " (causa retraso)" 
                : isOnTime ? " (sin afectar tiempo de entrega)" : ""}
            </p>
            <p className="text-xs text-amber-600">
              {service.weatherEvent.type || 'Lluvia intensa'} en {service.weatherEvent.location || 'área de tránsito'}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              Severidad: {service.weatherEvent.severity}/3 - Retraso potencial: {service.weatherEvent.estimatedDelay || '15-30 minutos'}
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
              {isOnTime ? " (sin afectar tiempo de entrega)" : ""}
            </p>
            <p className="text-xs text-red-600">
              Ubicación actual en zona marcada como insegura
            </p>
          </div>
        </div>
      )}
      
      {service.delayRisk && (
        <div className="flex items-center gap-2 py-2 px-3 bg-amber-50 rounded-md">
          <Timer className="h-4 w-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700">
              Riesgo de retraso detectado
              {isOnTime ? " (sin afectar tiempo de entrega actual)" : ""}
            </p>
            <p className="text-xs text-amber-600">
              {service.delayRiskPercent}% probabilidad de retraso
            </p>
          </div>
        </div>
      )}
      
      {!isOnTime && (
        <div className="border-t pt-2 mt-2">
          <p className="text-xs text-slate-500">
            Nuevo ETA esperado: <span className="font-medium text-red-500">{service.adjustedEta || service.eta}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Retraso total estimado: <span className="font-medium text-red-500">{service.estimatedDelayMinutes || "45"} minutos</span>
          </p>
        </div>
      )}
    </div>
  );
}
