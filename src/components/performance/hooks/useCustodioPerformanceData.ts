
import { useState, useEffect } from 'react';
import { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from 'xlsx';

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
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        
        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        console.log('Parsed Excel data:', jsonData);
        
        // Process the data into the required format
        // In a real implementation, you'd map the Excel data properly
        // This is a placeholder implementation
        
        const summaryMetrics: PerformanceMetric[] = [
          { 
            label: 'Total Custodios',
            value: 125,
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
        
        // Generate sample performance data
        const performanceByDay = Array.from({ length: 30 }, (_, i) => {
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
        
        // Generate sample custodios data with the corrected status type
        const custodios = Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          name: `Custodio ${i + 1}`,
          activeMonths: Math.floor(1 + Math.random() * 24),
          completedJobs: Math.floor(10 + Math.random() * 200),
          averageRating: 3.5 + Math.random() * 1.5,
          reliability: 3.2 + Math.random() * 1.8,
          responseTime: 2 + Math.random() * 4,
          earnings: Math.floor(5000 + Math.random() * 15000),
          ltv: Math.floor(25000 + Math.random() * 100000),
          status: Math.random() > 0.2 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'pending') as 'active' | 'inactive' | 'pending'
        }));
        
        // Sample revenue data
        const revenue = {
          totalRevenue: 1250000,
          averageRevenue: 10000,
          byMonth: Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            return {
              month: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(),
              revenue: Math.floor(80000 + Math.random() * 50000)
            };
          }),
          byService: [
            { service: 'Validaciones', revenue: 450000 },
            { service: 'Escoltas', revenue: 350000 },
            { service: 'Seguridad', revenue: 300000 },
            { service: 'Otros', revenue: 150000 }
          ]
        };
        
        // Sample retention data
        const retention = {
          retention30Days: 92,
          retention60Days: 85,
          retention90Days: 78,
          churnRate: 8,
          retentionByMonth: Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (11 - i));
            return {
              month: date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(),
              rate: 75 + Math.random() * 20
            };
          })
        };
        
        // Sample activity map data
        const activityMap = {
          locations: Array.from({ length: 50 }, () => ({
            lat: 19.4326 + (Math.random() - 0.5) * 0.5,
            lng: -99.1332 + (Math.random() - 0.5) * 0.5,
            weight: Math.random() * 10
          })),
          heatData: null
        };
        
        return {
          summaryMetrics,
          performanceByDay,
          custodios,
          revenue,
          retention,
          activityMap
        };
        
      } catch (error) {
        console.error("Error fetching or processing Excel data:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
