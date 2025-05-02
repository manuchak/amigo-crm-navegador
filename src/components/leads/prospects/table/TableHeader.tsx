
import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

const ProspectsTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="font-medium">Nombre</TableHead>
        <TableHead className="font-medium">Estado</TableHead>
        <TableHead className="font-medium">Teléfono</TableHead>
        <TableHead className="font-medium">Resultado Llamada</TableHead>
        <TableHead className="font-medium">Vehículo</TableHead>
        <TableHead className="font-medium">SEDENA</TableHead>
        <TableHead className="font-medium">Fecha Creación</TableHead>
        <TableHead className="text-right font-medium">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default ProspectsTableHeader;
