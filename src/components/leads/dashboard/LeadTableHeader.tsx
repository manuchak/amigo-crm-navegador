
import React from 'react';
import { TableRow, TableHead } from '@/components/ui/table';

const LeadTableHeader: React.FC = () => {
  return (
    <TableRow className="bg-slate-50 hover:bg-slate-100">
      <TableHead className="text-xs font-medium text-slate-500">Nombre</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Categoría</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Email</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Teléfono</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Estado</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Llamadas</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Última Llamada</TableHead>
      <TableHead className="text-xs font-medium text-slate-500">Fecha Creación</TableHead>
      <TableHead className="text-right text-xs font-medium text-slate-500">Acciones</TableHead>
    </TableRow>
  );
};

export default LeadTableHeader;
