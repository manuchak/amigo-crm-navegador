
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
import { parseCurrencyValue } from '../services/servicios/utils';
import { formatCurrency } from '../utils/formatters';
import { analyzeDataQuality } from '../utils/dataValidator';
import { AlertTriangle } from 'lucide-react';

interface ClientGrowthAnalysisProps {
  serviciosData: any[];
  isLoading: boolean;
  dateRange: DateRange;
  comparisonDateRange?: DateRange;
}

export function ClientGrowthAnalysis({ serviciosData, isLoading, dateRange, comparisonDateRange }: ClientGrowthAnalysisProps) {
  // Calculate GMV (Gross Merchandise Value)
  const { gmv, avgOrderValue, totalClients, dataQuality, hasValidGmvData } = useMemo(() => {
    if (!serviciosData || serviciosData.length === 0) {
      return { 
        gmv: 0, 
        avgOrderValue: 0, 
        totalClients: 0,
        dataQuality: null,
        hasValidGmvData: false
      };
    }
    
    // Analyze data quality first
    const dataQuality = analyzeDataQuality(serviciosData, 'cobro_cliente');
    console.log('cobro_cliente data quality analysis:', dataQuality);
    
    // Show detailed logging for debugging
    console.log('GMV calculation started with:', {
      totalServices: serviciosData.length,
      validCurrencyValues: dataQuality.validItems,
      sampleData: dataQuality.sampleData
    });
    
    // Sum all valid cobro_cliente values
    let totalValue = 0;
    let validValueCount = 0;
    let uniqueClients = new Set();
    let processedItems = 0;
    
    serviciosData.forEach((servicio, index) => {
      // Track unique clients
      if (servicio.nombre_cliente) {
        uniqueClients.add(servicio.nombre_cliente);
      }
      
      // Process cobro_cliente for GMV
      const rawValue = servicio.cobro_cliente;
      
      // Skip null/undefined/empty values
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        // Log some samples of missing values
        if (processedItems < 5) {
          console.log(`Item ${index}: Missing cobro_cliente value`, { 
            id: servicio.id,
            cobro_cliente: rawValue,
            nombre_cliente: servicio.nombre_cliente
          });
          processedItems++;
        }
        return;
      }
      
      try {
        // Parse the currency value
        const amount = parseCurrencyValue(rawValue);
        
        if (amount > 0) {
          totalValue += amount;
          validValueCount++;
          
          // Log some samples of successful parsing
          if (processedItems < 5) {
            console.log(`Item ${index}: Parsed cobro_cliente`, { 
              id: servicio.id,
              rawValue,
              parsedValue: amount,
              runningTotal: totalValue
            });
            processedItems++;
          }
        } else {
          // Log some samples of zero values
          if (processedItems < 5) {
            console.log(`Item ${index}: Zero value cobro_cliente`, { 
              id: servicio.id,
              rawValue,
              parsedValue: amount
            });
            processedItems++;
          }
        }
      } catch (error) {
        console.error(`Error processing cobro_cliente for item ${index}:`, error);
      }
    });
    
    // Calculate final values
    const gmv = totalValue;
    const avgOrderValue = validValueCount > 0 ? totalValue / validValueCount : 0;
    const totalClients = uniqueClients.size;
    
    console.log('GMV calculation results:', {
      gmv,
      avgOrderValue,
      totalClients,
      validValueCount,
      parseSuccessRate: `${Math.round((validValueCount / serviciosData.length) * 100)}%`
    });
    
    return { 
      gmv, 
      avgOrderValue, 
      totalClients,
      dataQuality,
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
  
  // If we don't have valid GMV data, show an alert
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
              {dataQuality && (
                <div className="mt-2 text-sm text-amber-600">
                  <p>Análisis de datos:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Total de registros: {dataQuality.totalItems}</li>
                    <li>Con valores válidos: {dataQuality.validItems} ({dataQuality.percentValid}%)</li>
                    <li>Con valores nulos: {dataQuality.nullOrUndefined}</li>
                    <li>Con valores vacíos: {dataQuality.emptyString}</li>
                    <li>Con valores no numéricos: {dataQuality.nonNumeric}</li>
                  </ul>
                </div>
              )}
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
            <h3 className="text-sm font-medium text-gray-500">GMV</h3>
            <p className="text-2xl font-bold mt-1">{formatCurrency(gmv)}</p>
          </div>
          
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">AOV</h3>
            <p className="text-2xl font-bold mt-1">{formatCurrency(avgOrderValue)}</p>
          </div>
          
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Clientes</h3>
            <p className="text-2xl font-bold mt-1">{totalClients}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
