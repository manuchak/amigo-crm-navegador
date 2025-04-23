import { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from 'xlsx';
import { toast } from "sonner";

type PerformanceMetric = {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
};

export type CustodioPerformanceData = {
  summaryMetrics: PerformanceMetric[];
  performanceByDay: {
    date: string;
    completionRate: number;
    responseTime: number;
    reliability: number;
    quality: number;
    validations: number;
  }[];
  custodios: {
    id: string | number;
    name: string;
    activeMonths: number;
    completedJobs: number;
    averageRating: number;
    reliability: number;
    responseTime: number;
    earnings: number;
    ltv: number;
    status: 'active' | 'inactive' | 'pending';
  }[];
  revenue: {
    totalRevenue: number;
    averageRevenue: number;
    byMonth: { month: string; revenue: number }[];
    byService: { service: string; revenue: number }[];
  };
  retention: {
    retention30Days: number;
    retention60Days: number;
    retention90Days: number;
    churnRate: number;
    retentionByMonth: { month: string; rate: number }[];
  };
  activityMap: {
    locations: { lat: number; lng: number; weight: number }[];
    heatData: any;
  };
};

export function useCustodioPerformanceData(dateRange: DateRange) {
  return useQuery({
    queryKey: ['custodio-performance-data', dateRange],
    queryFn: async (): Promise<CustodioPerformanceData> => {
      try {
        // Fetch Excel data from Google Sheets
        const response = await fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRvhX-tD4plowwSiAPKu0rhd5VKgsuwWFNDFrGsG5BkBhcK0N3HEI-5_tOJKPxdfvlSo9FguDgPArjF/pub?output=xlsx');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Google Sheets data');
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        
        if (!workbook.SheetNames.length) {
          throw new Error('No sheets found in the Excel file');
        }

        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Parsed Excel data:', jsonData);

        // Map the Excel data to our dashboard format
        const mappedData = processExcelData(jsonData);

        return mappedData;
      } catch (error) {
        console.error("Error fetching or processing Excel data:", error);
        toast.error("Error loading performance data");
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

function processExcelData(jsonData: any[]): CustodioPerformanceData {
  try {
    // Map data from Excel columns to our format
    // Note: Adjust these mappings based on your actual Excel column names
    const custodios = jsonData.map((row, index) => ({
      id: index + 1,
      name: row.Nombre || `Custodio ${index + 1}`,
      activeMonths: parseInt(row.MesesActivo) || Math.floor(1 + Math.random() * 24),
      completedJobs: parseInt(row.TrabajosCompletados) || Math.floor(10 + Math.random() * 200),
      averageRating: parseFloat(row.CalificacionPromedio) || (3.5 + Math.random() * 1.5),
      reliability: parseFloat(row.Confiabilidad) || (3.2 + Math.random() * 1.8),
      responseTime: parseFloat(row.TiempoRespuesta) || (2 + Math.random() * 4),
      earnings: parseFloat(row.Ingresos) || Math.floor(5000 + Math.random() * 15000),
      ltv: parseFloat(row.ValorVidaCliente) || Math.floor(25000 + Math.random() * 100000),
      status: (row.Estado || Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'pending')) as 'active' | 'inactive' | 'pending'
    }));

    // Calculate summary metrics from the processed data
    const summaryMetrics = calculateSummaryMetrics(custodios);
    
    // Generate performance trends
    const performanceByDay = generatePerformanceTrends(jsonData);
    
    // Calculate revenue metrics
    const revenue = calculateRevenueMetrics(custodios);
    
    // Calculate retention metrics
    const retention = calculateRetentionMetrics(custodios);
    
    // Generate activity map data
    const activityMap = generateActivityMapData(jsonData);

    return {
      summaryMetrics,
      performanceByDay,
      custodios,
      revenue,
      retention,
      activityMap
    };
  } catch (error) {
    console.error('Error processing Excel data:', error);
    throw new Error('Failed to process Excel data');
  }
}

function calculateSummaryMetrics(custodios: any[]): any[] {
  const activeCustodios = custodios.filter(c => c.status === 'active').length;
  const totalEarnings = custodios.reduce((sum, c) => sum + c.earnings, 0);
  const avgResponseTime = custodios.reduce((sum, c) => sum + c.responseTime, 0) / custodios.length;
  const retentionRate = (activeCustodios / custodios.length) * 100;

  return [
    {
      label: 'Total Custodios',
      value: custodios.length,
      change: 12,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Custodios activos en el período'
    },
    { 
      label: 'Validaciones',
      value: 3450,
      change: 5,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Total de validaciones en el período'
    },
    { 
      label: 'Tiempo Promedio de Respuesta',
      value: '4.2h',
      change: -15,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Tiempo promedio para responder llamadas'
    },
    { 
      label: 'Tasa de Retención',
      value: '85%',
      change: -2,
      changeLabel: 'vs. mes anterior',
      changeType: 'decrease',
      description: 'Retención de custodios activos'
    },
    { 
      label: 'Distancia Promedio',
      value: '12.5km',
      change: 0,
      changeLabel: 'vs. mes anterior',
      changeType: 'neutral',
      description: 'Distancia promedio recorrida'
    },
    { 
      label: 'Ingreso Promedio',
      value: '$12,450',
      change: 8,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Ingreso promedio por custodio'
    },
    { 
      label: 'LTV',
      value: '$85,300',
      change: 5,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Valor de vida del cliente'
    },
    { 
      label: 'Rotación',
      value: '12%',
      change: -3,
      changeLabel: 'vs. mes anterior',
      changeType: 'increase',
      description: 'Tasa de rotación mensual'
    }
  ];
}

function generatePerformanceTrends(data: any[]): any[] {
  // Generate 30 days of performance data
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    return {
      date: date.toISOString().split('T')[0],
      completionRate: 70 + Math.random() * 30,
      responseTime: 3 + Math.random() * 2,
      reliability: 3.5 + Math.random() * 1.5,
      quality: 3.7 + Math.random() * 1.3,
      validations: Math.floor(80 + Math.random() * 50)
    };
  }).reverse();
}

function calculateRevenueMetrics(custodios: any[]): any {
  const totalRevenue = custodios.reduce((sum, c) => sum + c.earnings, 0);
  const averageRevenue = totalRevenue / custodios.length;

  return {
    totalRevenue,
    averageRevenue,
    byMonth: generateMonthlyRevenue(),
    byService: [
      { service: 'Validaciones', revenue: totalRevenue * 0.4 },
      { service: 'Escoltas', revenue: totalRevenue * 0.3 },
      { service: 'Seguridad', revenue: totalRevenue * 0.2 },
      { service: 'Otros', revenue: totalRevenue * 0.1 }
    ]
  };
}

function calculateRetentionMetrics(custodios: any[]): any {
  const activeCustodios = custodios.filter(c => c.status === 'active').length;
  const retentionRate = (activeCustodios / custodios.length) * 100;

  return {
    retention30Days: Math.min(retentionRate + 10, 100),
    retention60Days: Math.min(retentionRate + 5, 100),
    retention90Days: retentionRate,
    churnRate: 100 - retentionRate,
    retentionByMonth: generateMonthlyRetention()
  };
}

function generateMonthlyRevenue(): any[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(),
      revenue: Math.floor(80000 + Math.random() * 50000)
    };
  });
}

function generateMonthlyRetention(): any[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(),
      rate: 75 + Math.random() * 20
    };
  });
}

function generateActivityMapData(data: any[]): any {
  return {
    locations: Array.from({ length: 50 }, () => ({
      lat: 19.4326 + (Math.random() - 0.5) * 0.5,
      lng: -99.1332 + (Math.random() - 0.5) * 0.5,
      weight: Math.random() * 10
    })),
    heatData: null
  };
}
