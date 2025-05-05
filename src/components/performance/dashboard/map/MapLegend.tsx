
import React from 'react';
import { AlertTriangle, CheckCircle, Clock, CloudRain, ArrowDown } from 'lucide-react';

export function MapLegend() {
  return (
    <div className="absolute right-2 bottom-12 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-md border text-[8px]">
      <div className="font-medium mb-1 text-[10px]">Leyenda</div>
      
      <div className="space-y-1">
        <div className="font-medium text-[7px] uppercase text-slate-500 mb-0.5">Estado del Servicio</div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Servicio en tiempo</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 flex items-center justify-center">
            <Clock className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Servicio con retraso</span>
        </div>
        
        <div className="border-t border-slate-200 my-1 pt-1">
          <div className="font-medium text-[7px] uppercase text-slate-500 mb-0.5">Incidencias</div>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500 flex items-center justify-center">
            <CloudRain className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Alerta climática con retraso</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 flex items-center justify-center">
            <CloudRain className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Alerta climática sin retraso</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 flex items-center justify-center">
            <ArrowDown className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Bloqueo vial con retraso</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-orange-500 flex items-center justify-center">
            <ArrowDown className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Bloqueo vial sin retraso</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500 flex items-center justify-center">
            <AlertTriangle className="h-1.5 w-1.5 text-white" />
          </div>
          <span>Zona de riesgo</span>
        </div>
        
        <div className="border-t border-slate-200 my-1 pt-1">
          <div className="font-medium text-[7px] uppercase text-slate-500 mb-0.5">Áreas y Rutas</div>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-sm bg-red-200/70 border border-red-400"></div>
          <span>Área de alto riesgo</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-3 bg-green-500"></div>
          <span>Ruta en tiempo</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="h-0.5 w-3 bg-amber-500 border-b border-dashed border-amber-600"></div>
          <span>Ruta con retraso</span>
        </div>
      </div>
    </div>
  );
}
