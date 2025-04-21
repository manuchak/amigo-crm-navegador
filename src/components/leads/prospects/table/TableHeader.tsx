
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nombre</TableHead>
        <TableHead>Contacto</TableHead>
        <TableHead>Estado</TableHead>
        <TableHead>Vehículo</TableHead>
        <TableHead>SEDENA</TableHead>
        <TableHead>Llamadas</TableHead>
        <TableHead>Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TableHeader;
