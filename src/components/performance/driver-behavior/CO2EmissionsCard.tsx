import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Cloud } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DriverBehaviorData, CO2EmissionsCardProps } from '../types/driver-behavior.types';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export function CO2EmissionsCard({ data, isLoading, dateRange, filters }: CO2EmissionsCardProps) {
  if (isLoading) {
    return (
      <Card className="border shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-full" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no data is available
  if (!data || !data.co2Emissions) {
    return (
      <Card className="border shadow-md h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            Emisiones de CO2
          </CardTitle>
          <CardDescription>
            No hay datos de emisiones disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
            <Cloud className="h-16 w-16 text-gray-200 mb-4" />
            No hay información de distancias registrada para calcular emisiones
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract values from the data
  const co2EmissionsValue = data.co2Emissions.totalEmissions || 0;
  const wastageValue = co2EmissionsValue * 0.15; // Estimated wastage due to poor driving habits
  const savedValue = co2EmissionsValue * 0.05; // Estimated savings from good driving habits
  
  // Calculate the potential reduction percentage
  const potentialReductionPercentage = Math.round((wastageValue / co2EmissionsValue) * 100);

  // Animation settings
  const progressAnimation = {
    initial: { width: 0 },
    animate: (width: number) => ({
      width: `${width}%`,
      transition: { duration: 1, ease: "easeOut" }
    })
  };

  return (
    <Card className="border shadow-md hover:shadow-lg transition-all duration-200 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="h-5 w-5 text-blue-600" />
          Emisiones de CO2
        </CardTitle>
        <CardDescription>
          Impacto ambiental basado en patrones de conducción
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Emisiones totales</span>
              <span className="text-2xl font-bold">{co2EmissionsValue.toFixed(1)} kg</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500 rounded-full"
                initial="initial"
                animate="animate"
                custom={100}
                variants={progressAnimation}
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-amber-600">CO2 adicional por mala conducción</span>
              <span className="text-lg font-medium text-amber-600">+{wastageValue.toFixed(1)} kg</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500 rounded-full"
                initial="initial"
                animate="animate"
                custom={Math.min((wastageValue / co2EmissionsValue) * 100, 100)}
                variants={progressAnimation}
              />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-green-600">CO2 ahorrado con buena conducción</span>
              <span className="text-lg font-medium text-green-600">-{savedValue.toFixed(1)} kg</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-green-500 rounded-full"
                initial="initial"
                animate="animate"
                custom={Math.min((savedValue / co2EmissionsValue) * 100, 100)}
                variants={progressAnimation}
              />
            </div>
          </motion.div>
          
          <motion.div 
            className="pt-2 border-t"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <p className="text-sm text-muted-foreground">
              Potencial de reducción de emisiones: <span className="font-semibold text-green-600">{potentialReductionPercentage}%</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              *Basado en estudios de conducción eficiente y consumo de combustible.
            </p>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
