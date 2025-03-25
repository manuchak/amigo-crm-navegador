
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface CustodioRequirement {
  id: number;
  ciudad: string;
  mes: string;
  cantidad: number;
  armado: boolean;
  zona?: string;
  solicitante: string;
  fechaCreacion: string;
}

interface CustodioRequirementsTableProps {
  requirements: CustodioRequirement[];
  onDelete: (id: number) => void;
}

const CustodioRequirementsTable: React.FC<CustodioRequirementsTableProps> = ({ 
  requirements, 
  onDelete 
}) => {
  if (requirements.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No hay requisitos de custodios registrados. Haga clic en "Nuevo Requisito" para agregar uno.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ciudad</TableHead>
          <TableHead>Mes</TableHead>
          <TableHead>Cantidad</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Zona</TableHead>
          <TableHead>Solicitante</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements.map((req) => (
          <TableRow key={req.id}>
            <TableCell>{req.ciudad}</TableCell>
            <TableCell>{req.mes}</TableCell>
            <TableCell>{req.cantidad}</TableCell>
            <TableCell>{req.armado ? 'Armado' : 'Sin arma'}</TableCell>
            <TableCell>{req.zona || '-'}</TableCell>
            <TableCell>{req.solicitante}</TableCell>
            <TableCell>{new Date(req.fechaCreacion).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(req.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default CustodioRequirementsTable;
