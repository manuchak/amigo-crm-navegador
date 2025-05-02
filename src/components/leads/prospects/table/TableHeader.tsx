
import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const ProspectsTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow className="bg-slate-50 hover:bg-slate-50">
        <TableHead className="font-semibold text-xs text-slate-600 w-52">Nombre</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 w-32">Estado</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 w-40">Teléfono</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 w-48">Llamadas</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 w-40">Vehículo</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 w-24">SEDENA</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 w-32">Fecha Creación</TableHead>
        <TableHead className="font-semibold text-xs text-slate-600 text-right">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProspectsTableHeader;
