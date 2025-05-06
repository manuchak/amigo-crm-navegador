
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, AlertCircle, AlertOctagon } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import { RiskAssessment, DriverBehaviorFilters } from '../types/driver-behavior.types';
import { DateRange } from 'react-day-picker';

interface DriverRiskAssessmentProps {
  dateRange: DateRange;
  filters: DriverBehaviorFilters;
  riskData?: RiskAssessment;
  isLoading: boolean;
}

export function DriverRiskAssessment({ dateRange, filters, riskData, isLoading }: DriverRiskAssessmentProps) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!riskData) {
    return (
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Evaluación de Riesgo</CardTitle>
          <CardDescription>
            No hay datos disponibles para análisis de riesgo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            Necesita más datos para generar una evaluación de riesgo
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskIcon = () => {
    switch (riskData.level) {
      case 'low':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'medium':
        return <Clock className="h-12 w-12 text-amber-500" />;
      case 'high':
        return <AlertCircle className="h-12 w-12 text-orange-500" />;
      case 'critical':
        return <AlertOctagon className="h-12 w-12 text-red-600" />;
      default:
        return <AlertTriangle className="h-12 w-12 text-gray-500" />;
    }
  };

  const getRiskColor = () => {
    switch (riskData.level) {
      case 'low': return 'bg-green-50 border-green-100 text-green-800';
      case 'medium': return 'bg-amber-50 border-amber-100 text-amber-800';
      case 'high': return 'bg-orange-50 border-orange-100 text-orange-800';
      case 'critical': return 'bg-red-50 border-red-100 text-red-800';
      default: return 'bg-gray-50 border-gray-100 text-gray-800';
    }
  };

  const getRiskTitle = () => {
    switch (riskData.level) {
      case 'low': return 'Riesgo Bajo';
      case 'medium': return 'Riesgo Moderado';
      case 'high': return 'Riesgo Alto';
      case 'critical': return 'Riesgo Crítico';
      default: return 'Riesgo Indeterminado';
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Evaluación de Riesgo</CardTitle>
        <CardDescription>
          Análisis de probabilidad de accidentes basado en comportamiento de conducción
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className={`flex items-center p-4 rounded-lg ${getRiskColor()} border`}>
            {getRiskIcon()}
            <div className="ml-4">
              <h4 className="font-medium">{getRiskTitle()}</h4>
              <p className="text-sm">{riskData.description}</p>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Puntaje de Riesgo: {riskData.score.toFixed(1)}/100</h4>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className={`h-2.5 rounded-full ${
                  riskData.level === 'low' ? 'bg-green-500' :
                  riskData.level === 'medium' ? 'bg-amber-500' :
                  riskData.level === 'high' ? 'bg-orange-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${riskData.score}%` }}
              ></div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Recomendaciones:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {riskData.recommendations.map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
