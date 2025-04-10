
import React from 'react';
import { TableHeader, TableRow, TableHead } from '@/components/ui/table';

interface StandardHeadersProps {}

export const StandardTableHeaders: React.FC<StandardHeadersProps> = () => (
  <TableHeader>
    <TableRow className="bg-gray-50">
      <TableHead>Fecha/Hora</TableHead>
      <TableHead>Teléfono</TableHead>
      <TableHead>Dirección</TableHead>
      <TableHead>Duración</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  </TableHeader>
);

interface ExtendedHeadersProps {}

export const ExtendedTableHeaders: React.FC<ExtendedHeadersProps> = () => (
  <TableHeader>
    <TableRow className="bg-gray-50">
      <TableHead>Call ID</TableHead>
      <TableHead>Asistente</TableHead>
      <TableHead>Teléfono Asistente</TableHead>
      <TableHead>Teléfono Cliente</TableHead>
      <TableHead>Tipo</TableHead>
      <TableHead>Duración</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead>Razón Finalización</TableHead>
      <TableHead>Costo</TableHead>
      <TableHead>Fecha</TableHead>
      <TableHead>Evaluación</TableHead>
      <TableHead className="text-right">Acciones</TableHead>
    </TableRow>
  </TableHeader>
);
