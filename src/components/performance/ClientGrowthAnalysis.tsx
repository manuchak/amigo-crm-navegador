
import React, { useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from '../utils/formatters';
import { AlertTriangle, Info } from 'lucide-react';

interface ClientGrowthAnalysisProps {
  serviciosData: any[];
  isLoading: boolean;
  dateRange: DateRange;
  comparisonDateRange?: DateRange;
}

export function ClientGrowthAnalysis({ serviciosData, isLoading, dateRange, comparisonDateRange }: ClientGrowthAnalysisProps) {
  // Calcular GMV (Gross Merchandise Value)
  const { gmv, avgOrderValue, totalClients, hasValidGmvData } = useMemo(() => {
    if (!serviciosData || serviciosData.length === 0) {
      return { 
        gmv: 0, 
        avgOrderValue: 0, 
        totalClients: 0,
        hasValidGmvData: false
      };
    }
    
    console.log('Iniciando cálculo de GMV con:', {
      totalServices: serviciosData.length,
      dataSample: serviciosData.slice(0, 3).map(s => ({
        id: s.id,
        cobro_cliente: s.cobro_cliente,
        tipo: typeof s.cobro_cliente
      }))
    });
    
    // Sumar todos los valores cobro_cliente válidos
    let totalValue = 0;
    let validValueCount = 0;
    let uniqueClients = new Set();
    
    serviciosData.forEach((servicio, index) => {
      // Seguir clientes únicos
      if (servicio.nombre_cliente) {
        uniqueClients.add(servicio.nombre_cliente);
      }
      
      // Procesar cobro_cliente para GMV 
      let amount = servicio.cobro_cliente;
      
      // Asegurar que amount sea numérico
      if (typeof amount === 'string') {
        // Limpiar la cadena antes de convertir
        const cleanValue = amount.replace(/[^\d.-]/g, '');
        amount = parseFloat(cleanValue);
      }
      
      // Omitir valores null/undefined/NaN/0
      if (amount === null || amount === undefined || isNaN(amount) || amount === 0) {
        return;
      }
      
      // Los valores ahora deberían ser numéricos
      if (typeof amount === 'number' && isFinite(amount) && amount > 0) {
        totalValue += amount;
        validValueCount++;
        
        // Registrar algunos ejemplos para depuración
        if (index < 5) {
          console.log(`Ítem ${index}: Valor cobro_cliente procesado`, { 
            id: servicio.id,
            valorOriginal: servicio.cobro_cliente,
            valorProcesado: amount,
            acumulado: totalValue
          });
        }
      }
    });
    
    // Calcular valores finales
    const gmv = totalValue;
    const avgOrderValue = validValueCount > 0 ? totalValue / validValueCount : 0;
    const totalClients = uniqueClients.size;
    
    console.log('Resultados del cálculo de GMV:', {
      gmv,
      avgOrderValue,
      totalClients,
      validValueCount,
      tasaÉxitoParseo: `${Math.round((validValueCount / (serviciosData.length || 1)) * 100)}%`
    });
    
    return { 
      gmv, 
      avgOrderValue, 
      totalClients,
      hasValidGmvData: validValueCount > 0
    };
  }, [serviciosData]);
  
  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Análisis de Crecimiento de Clientes</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[200px]">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 w-4 bg-primary/20 rounded-full"></div>
            <div className="h-4 w-4 bg-primary/40 rounded-full"></div>
            <div className="h-4 w-4 bg-primary/60 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Si no tenemos datos GMV válidos, mostrar una alerta
  if (!hasValidGmvData && serviciosData && serviciosData.length > 0) {
    return (
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Análisis de Crecimiento de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-800">No hay datos de GMV disponibles</AlertTitle>
            <AlertDescription className="text-amber-700">
              Los valores de "cobro_cliente" no están disponibles o no son válidos.
              <div className="mt-3 p-3 bg-white/50 rounded border border-amber-200">
                <p className="font-medium text-amber-800">Posible solución:</p>
                <p>Ejecute la función de limpieza de datos con: SELECT public.clean_cobro_cliente_values();</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Análisis de Crecimiento de Clientes</CardTitle>
        <CardDescription>
          Resumen financiero del período seleccionado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">GMV Total</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(gmv)}</h3>
            <p className="text-xs text-gray-400 mt-1">
              Valor bruto de mercancía
            </p>
          </div>
          
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Valor de Orden Promedio</p>
            <h3 className="text-2xl font-bold mt-1">{formatCurrency(avgOrderValue)}</h3>
            <p className="text-xs text-gray-400 mt-1">
              Por servicio
            </p>
          </div>
          
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total de Clientes</p>
            <h3 className="text-2xl font-bold mt-1">{totalClients}</h3>
            <p className="text-xs text-gray-400 mt-1">
              En el período seleccionado
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
