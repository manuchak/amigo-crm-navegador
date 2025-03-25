
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CustodioRequirement {
  id: number;
  ciudad: string;
  mes: string;
  cantidad: number;
  armado: boolean;
  zona?: string;
  solicitante: string;
  fechaCreacion: string;
  estado: 'solicitado' | 'recibido' | 'aceptado';
}

interface CustodioRequirementsTableProps {
  requirements: CustodioRequirement[];
  onDelete: (id: number) => void;
  onUpdateEstado?: (id: number, estado: 'solicitado' | 'recibido' | 'aceptado') => void;
}

// Componente de fila de tabla optimizado con React.memo
const TableRowMemo = React.memo(({ 
  req, 
  onDelete,
  onUpdateEstado
}: { 
  req: CustodioRequirement; 
  onDelete: (id: number) => void;
  onUpdateEstado?: (id: number, estado: 'solicitado' | 'recibido' | 'aceptado') => void;
}) => {
  const handleDelete = React.useCallback(() => {
    onDelete(req.id);
  }, [req.id, onDelete]);

  const handleUpdateEstado = React.useCallback(() => {
    if (onUpdateEstado) {
      let nextEstado: 'solicitado' | 'recibido' | 'aceptado' = 'solicitado';
      
      if (req.estado === 'solicitado') {
        nextEstado = 'recibido';
      } else if (req.estado === 'recibido') {
        nextEstado = 'aceptado';
      } else if (req.estado === 'aceptado') {
        nextEstado = 'solicitado';
      }
      
      onUpdateEstado(req.id, nextEstado);
    }
  }, [req.id, req.estado, onUpdateEstado]);

  const getBadgeVariant = () => {
    switch (req.estado) {
      case 'solicitado':
        return 'default';
      case 'recibido':
        return 'secondary';
      case 'aceptado':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getEstadoLabel = () => {
    switch (req.estado) {
      case 'solicitado':
        return 'Solicitado';
      case 'recibido':
        return 'Recibido Supply';
      case 'aceptado':
        return 'Aceptado Supply';
      default:
        return 'Desconocido';
    }
  };

  return (
    <TableRow className={req.estado === 'aceptado' ? 'bg-muted/30' : ''}>
      <TableCell>{req.ciudad}</TableCell>
      <TableCell>{req.mes}</TableCell>
      <TableCell>{req.cantidad}</TableCell>
      <TableCell>{req.armado ? 'Armado' : 'Sin arma'}</TableCell>
      <TableCell>{req.zona || '-'}</TableCell>
      <TableCell>{req.solicitante}</TableCell>
      <TableCell>{new Date(req.fechaCreacion).toLocaleDateString()}</TableCell>
      <TableCell>
        <Badge 
          variant={getBadgeVariant()}
          className="mr-2 cursor-pointer"
          onClick={handleUpdateEstado}
        >
          {getEstadoLabel()}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleUpdateEstado}
            className="text-gray-500"
            title="Cambiar estado"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleDelete}
            className="text-red-500"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

TableRowMemo.displayName = 'TableRowMemo';

// Componente principal optimizado con React.memo
const CustodioRequirementsTable = React.memo(({ 
  requirements, 
  onDelete,
  onUpdateEstado
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
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requirements.map((req) => (
          <TableRowMemo 
            key={req.id} 
            req={req} 
            onDelete={onDelete}
            onUpdateEstado={onUpdateEstado}
          />
        ))}
      </TableBody>
    </Table>
  );
});

CustodioRequirementsTable.displayName = 'CustodioRequirementsTable';

export default CustodioRequirementsTable;
