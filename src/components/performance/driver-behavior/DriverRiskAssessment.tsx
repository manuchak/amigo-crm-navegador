import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Metric } from '@/components/ui/metric';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { DriverRiskAssessmentProps, RiskAssessment } from '../types/driver-behavior.types';

const riskLevelColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const riskLevelIcons = {
  low: ShieldCheck,
  medium: ShieldAlert,
  high: AlertTriangle,
  critical: AlertTriangle,
};

export function DriverRiskAssessment({ dateRange, filters, riskData, isLoading }: DriverRiskAssessmentProps) {
  if (isLoading) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!riskData) {
    return (
      <Card className="border shadow-md">
        <CardHeader>
          <CardTitle>Evaluación de Riesgo de Conductores</CardTitle>
          <CardDescription>No hay datos disponibles para mostrar la evaluación de riesgo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          No hay suficiente información para realizar una evaluación de riesgo.
        </CardContent>
      </Card>
    );
  }

  const RiskLevelIcon = riskLevelIcons[riskData.level];

  return (
    <Card className="border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Evaluación de Riesgo de Conductores
          <Badge className={`${riskLevelColors[riskData.level]} text-sm font-medium rounded-full px-2.5 py-0.5`}>
            {riskData.riskLevel}
          </Badge>
        </CardTitle>
        <CardDescription>{riskData.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Metric
            title="Conductores en Alto Riesgo"
            value={riskData.highRiskCount}
            trend="+12%"
            trendType="increase"
            icon={AlertTriangle}
          />
          <Metric
            title="Conductores en Riesgo Medio"
            value={riskData.mediumRiskCount}
            trend="-5%"
            trendType="decrease"
            icon={ShieldAlert}
          />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recomendaciones</h4>
          <ul className="list-disc pl-5 text-sm text-muted-foreground">
            {riskData.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
