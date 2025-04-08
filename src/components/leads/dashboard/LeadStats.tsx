
import React from 'react';
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';

interface LeadStatsProps {
  stats: {
    total: number;
    nuevos: number;
    contactados: number;
    calificados: number;
    rechazados: number;
  };
}

const LeadStats: React.FC<LeadStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs text-slate-500">Total de Leads</CardDescription>
          <CardTitle className="text-2xl font-light">{stats.total}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs text-slate-500">Nuevos</CardDescription>
          <CardTitle className="text-2xl font-light">{stats.nuevos}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs text-slate-500">Contactados</CardDescription>
          <CardTitle className="text-2xl font-light">{stats.contactados}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs text-slate-500">Calificados</CardDescription>
          <CardTitle className="text-2xl font-light">{stats.calificados}</CardTitle>
        </CardHeader>
      </Card>
      <Card className="shadow-sm border-slate-100">
        <CardHeader className="pb-2">
          <CardDescription className="text-xs text-slate-500">Rechazados</CardDescription>
          <CardTitle className="text-2xl font-light">{stats.rechazados}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
};

export default LeadStats;
