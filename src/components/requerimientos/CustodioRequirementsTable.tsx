
import React, { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash, CheckCircle, User, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CustodioRequirement } from './types';

interface CustodioRequirementsTableProps {
  requirements: CustodioRequirement[];
  onDelete: (id: number) => void;
  onUpdateEstado?: (id: number, estado: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado') => void;
}

// Format date and time for display
const formatDateTime = (date: string, time?: string) => {
  if (!date) return '-';
  
  const formattedDate = new Date(date).toLocaleDateString();
  return time ? `${formattedDate} ${time}` : formattedDate;
};

// Custom Alert component for delayed requirements
const DelayAlert = () => {
  return (
    <Alert className="mb-4 border-pink-200 bg-pink-50 text-pink-800">
      <AlertTriangle className="h-4 w-4 text-pink-800" />
      <AlertTitle className="text-pink-800 font-medium">Alerta de Retraso</AlertTitle>
      <AlertDescription className="text-pink-700">
        Existen requisitos de custodios retrasados para el mes en curso. Por favor, revise y actualice su estado.
      </AlertDescription>
    </Alert>
  );
};

// Check if a requirement is delayed (in current month and still in "solicitado" status)
const isDelayedRequirement = (requirements: CustodioRequirement[]) => {
  const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' });
  return requirements.some(req => 
    req.estado === 'retrasado' || 
    (req.estado === 'solicitado' && req.mes.toLowerCase() === currentMonth.toLowerCase())
  );
};

// Componente de fila de tabla optimizado con React.memo
const TableRowMemo = React.memo(({ 
  req, 
  onDelete,
  onUpdateEstado
}: { 
  req: CustodioRequirement; 
  onDelete: (id: number) => void;
  onUpdateEstado?: (id: number, estado: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado') => void;
}) => {
  const handleDelete = React.useCallback(() => {
    onDelete(req.id);
  }, [req.id, onDelete]);

  const handleUpdateEstado = React.useCallback(() => {
    if (onUpdateEstado && req.estado !== 'aceptado') {
      let nextEstado: 'solicitado' | 'recibido' | 'aceptado' | 'retrasado' = 'solicitado';
      
      if (req.estado === 'solicitado') {
        nextEstado = 'recibido';
      } else if (req.estado === 'recibido') {
        nextEstado = 'aceptado';
      } else if (req.estado === 'retrasado') {
        nextEstado = 'recibido';
      }
      
      onUpdateEstado(req.id, nextEstado);
    }
  }, [req.id, req.estado, onUpdateEstado]);

  const getBadgeVariant = () => {
    switch (req.estado) {
      case 'solicitado':
        return 'warning';
      case 'recibido':
        return 'info';
      case 'aceptado':
        return 'success';
      case 'retrasado':
        return 'destructive';
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
      case 'retrasado':
        return 'Retrasado';
      default:
        return 'Desconocido';
    }
  };

  // Determine if buttons should be disabled
  const isStateChangeDisabled = req.estado === 'aceptado';

  return (
    <TableRow className={
      req.estado === 'aceptado' ? 'bg-green-50' : 
      req.estado === 'retrasado' ? 'bg-pink-50' : ''
    }>
      <TableCell>{req.ciudad}</TableCell>
      <TableCell>{req.mes}</TableCell>
      <TableCell>{req.cantidad}</TableCell>
      <TableCell>{req.tipoCustodio}</TableCell>
      <TableCell>{req.zona || '-'}</TableCell>
      <TableCell>{req.solicitante}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-sm">
                <Clock className="h-3 w-3 mr-1 text-gray-500" />
                <span>{formatDateTime(req.fechaCreacion)}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Creado el {formatDateTime(req.fechaCreacion, req.horaCreacion)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <Badge 
          variant={getBadgeVariant() as any}
          className={`mr-2 ${!isStateChangeDisabled ? 'cursor-pointer' : ''}`}
          onClick={!isStateChangeDisabled ? handleUpdateEstado : undefined}
        >
          {getEstadoLabel()}
        </Badge>
        {req.estado === 'retrasado' && (
          <AlertTriangle className="h-3 w-3 inline ml-1 text-red-500" />
        )}
      </TableCell>
      <TableCell>
        {req.estado === 'aceptado' && req.usuarioAprobador && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-green-700">
                  <User className="h-3 w-3 mr-1" />
                  <span>{req.usuarioAprobador}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aprobado el {formatDateTime(req.fechaAprobacion || '', req.horaAprobacion)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleUpdateEstado}
            className="text-gray-500 hover:text-blue-500"
            title={isStateChangeDisabled ? "No se puede cambiar el estado una vez aceptado" : "Cambiar estado"}
            disabled={isStateChangeDisabled}
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
  // Check for delays and update status accordingly
  useEffect(() => {
    // This effect checks for delayed requirements and can be extended to automatically update them
    const currentMonth = new Date().toLocaleString('es-ES', { month: 'long' }).toLowerCase();
    
    requirements.forEach(req => {
      if (req.estado === 'solicitado' && req.mes.toLowerCase() === currentMonth && onUpdateEstado) {
        // We're just identifying them here, actual update is handled by the hook to avoid circular dependencies
      }
    });
  }, [requirements, onUpdateEstado]);

  if (requirements.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No hay requisitos de custodios registrados. Haga clic en "Nuevo Requisito" para agregar uno.
      </div>
    );
  }

  // Show delay alert if there are delayed requirements
  const hasDelayedReqs = isDelayedRequirement(requirements);

  return (
    <>
      {hasDelayedReqs && <DelayAlert />}
      
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
            <TableHead>Aprobador</TableHead>
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
    </>
  );
});

CustodioRequirementsTable.displayName = 'CustodioRequirementsTable';

export default CustodioRequirementsTable;
