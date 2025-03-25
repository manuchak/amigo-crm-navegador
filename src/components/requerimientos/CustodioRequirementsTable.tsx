
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

// Componente de fila de tabla optimizado con React.memo
const TableRowMemo = React.memo(({ 
  req, 
  onDelete 
}: { 
  req: CustodioRequirement; 
  onDelete: (id: number) => void;
}) => {
  const handleDelete = React.useCallback(() => {
    onDelete(req.id);
  }, [req.id, onDelete]);

  return (
    <TableRow>
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
          onClick={handleDelete}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
});

TableRowMemo.displayName = 'TableRowMemo';

// Componente principal optimizado con React.memo
const CustodioRequirementsTable = React.memo(({ 
  requirements, 
  onDelete 
}: CustodioRequirementsTableProps) => {
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
          <TableRowMemo 
            key={req.id} 
            req={req} 
            onDelete={onDelete} 
          />
        ))}
      </TableBody>
    </Table>
  );
});

CustodioRequirementsTable.displayName = 'CustodioRequirementsTable';

export default CustodioRequirementsTable;
