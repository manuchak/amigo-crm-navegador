
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const ProspectsTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[220px]">Nombre</TableHead>
        <TableHead className="w-[160px]">Contacto</TableHead>
        <TableHead className="w-[120px]">Estado</TableHead>
        <TableHead className="w-[160px]">Vehículo</TableHead>
        <TableHead className="w-[140px]">SEDENA</TableHead>
        <TableHead className="w-[180px]">Llamadas</TableHead>
        <TableHead className="w-[140px] text-right">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};
